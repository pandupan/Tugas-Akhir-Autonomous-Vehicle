from __future__ import annotations

import base64
from urllib.request import Request, urlopen

import cv2
import numpy as np
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response

from app.config import settings
from app.hvi import HVIEnhancer
from app.yolo_service import KITTI_CLASS_NAMES, YoloService


KITTI_DEMO_VIDEO_URL = "https://ultralytics.com/assets/kitti-inference-vid.mp4"
HVI_AUTO_BRIGHTNESS_THRESHOLD = 50.0


app = FastAPI(
    title="AutoVision Inference API",
    description="Realtime frame inference for YOLOv12 baseline, YOLOv12 + SKNet, and optional HVI-CIDNet preprocessing.",
    version="0.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Service dibuat satu kali. Bobotnya tetap dimuat secara lazy pada request pertama.
yolo_service = YoloService(
    baseline_path=settings.baseline_model_path,
    sknet_path=settings.sknet_model_path,
    device=settings.inference_device,
)
hvi_enhancer = HVIEnhancer(
    repo_dir=settings.hvi_repo_dir,
    weight_path=settings.hvi_model_path,
    device=settings.inference_device,
    max_dim=settings.hvi_max_dim,
)


def _validate_model_key(model_key: str) -> str:
    normalized = model_key.lower().strip()
    if normalized not in {"baseline", "sknet"}:
        raise HTTPException(status_code=400, detail="model_key must be 'baseline' or 'sknet'")
    return normalized


async def _read_image_upload(file: UploadFile) -> np.ndarray:
    payload = await file.read()
    if not payload:
        raise HTTPException(status_code=400, detail="Uploaded image is empty.")
    encoded = np.frombuffer(payload, dtype=np.uint8)
    image = cv2.imdecode(encoded, cv2.IMREAD_COLOR)
    if image is None:
        raise HTTPException(status_code=400, detail="Uploaded file is not a readable image frame.")
    return image


def _encode_bgr_data_url(image_bgr: np.ndarray, quality: int = 85) -> str:
    ok, encoded = cv2.imencode(".jpg", image_bgr, [int(cv2.IMWRITE_JPEG_QUALITY), quality])
    if not ok:
        raise HTTPException(status_code=500, detail="Could not encode inference frame.")
    payload = base64.b64encode(encoded.tobytes()).decode("ascii")
    return f"data:image/jpeg;base64,{payload}"


def _brightness_score(image_bgr: np.ndarray) -> float:
    y_channel = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2YCrCb)[:, :, 0]
    return float(np.mean(y_channel))


def _hvi_available() -> bool:
    return settings.hvi_model_path.exists() and settings.hvi_repo_dir.exists()


def _resolve_hvi_mode(hvi_mode: str, use_hvi: bool, brightness: float) -> tuple[str, bool]:
    """Tentukan apakah HVI dijalankan: off, selalu on, atau otomatis saat frame gelap."""
    normalized = hvi_mode.lower().strip()
    if use_hvi:
        normalized = "on"
    if normalized not in {"off", "auto", "on"}:
        raise HTTPException(status_code=400, detail="hvi_mode must be 'off', 'auto', or 'on'")

    active = normalized == "on" or (
        normalized == "auto" and brightness < HVI_AUTO_BRIGHTNESS_THRESHOLD
    )
    if active and not _hvi_available():
        raise HTTPException(status_code=503, detail="HVI-CIDNet is requested but model weight or repo path is not available.")
    return normalized, active


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "device": settings.inference_device,
        "models": {
            key: {"path": str(path), "exists": path.exists()}
            for key, path in settings.model_paths()
        },
        "hvi_repo_exists": settings.hvi_repo_dir.exists(),
        "hvi_auto_brightness_threshold": HVI_AUTO_BRIGHTNESS_THRESHOLD,
        "storage": "in-memory-frame-stream",
        "class_names": KITTI_CLASS_NAMES,
        "demo_video_url": KITTI_DEMO_VIDEO_URL,
    }


@app.get("/models")
def models() -> dict:
    return {
        "models": [
            {
                "key": "baseline",
                "name": "YOLOv12n Baseline",
                "description": "Model pembanding tanpa SKAttention.",
                "available": yolo_service.model_exists("baseline"),
            },
            {
                "key": "sknet",
                "name": "YOLOv12n + SKNet",
                "description": "Model utama dengan Selective Kernel Attention.",
                "available": yolo_service.model_exists("sknet"),
            },
        ],
        "class_names": KITTI_CLASS_NAMES,
        "preprocessing": [
            {
                "key": "hvi_cidnet",
                "name": "HVI-CIDNet Low-Light Enhancement",
                "description": "Opsi preprocessing sebelum deteksi untuk video malam/minim cahaya.",
                "available": settings.hvi_model_path.exists() and settings.hvi_repo_dir.exists(),
            }
        ],
    }


@app.get("/classes")
def classes() -> dict:
    return {"class_names": KITTI_CLASS_NAMES}


@app.get("/demo/kitti-video")
def demo_kitti_video() -> Response:
    request = Request(KITTI_DEMO_VIDEO_URL, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urlopen(request, timeout=30) as response:
            payload = response.read()
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Could not fetch KITTI demo video: {exc}") from exc

    return Response(
        content=payload,
        media_type="video/mp4",
        headers={
            "Cache-Control": "public, max-age=3600",
            "Content-Disposition": "inline; filename=kitti-inference-vid.mp4",
        },
    )


@app.post("/detect/frame")
async def detect_frame(
    file: UploadFile = File(...),
    model_key: str = Form("sknet"),
    use_hvi: bool = Form(False),
    hvi_mode: str = Form("off"),
    distance_enabled: bool = Form(False),
    lane_enabled: bool = Form(False),
    steering_enabled: bool = Form(False),
    center_line_enabled: bool = Form(False),
    conf: float = Form(0.35),
    imgsz: int = Form(640),
) -> JSONResponse:
    # 1) Baca frame dan putuskan preprocessing yang diperlukan.
    model_key = _validate_model_key(model_key)
    frame = await _read_image_upload(file)
    brightness = _brightness_score(frame)
    hvi_mode, hvi_applied = _resolve_hvi_mode(hvi_mode, use_hvi, brightness)

    inference_frame = frame
    if hvi_applied:
        inference_frame = hvi_enhancer.enhance_bgr(frame)

    # 2) Jalankan salah satu weight YOLO. Overlay tambahan dikerjakan setelah prediksi.
    result = yolo_service.predict_frame(
        inference_frame,
        model_key=model_key,
        conf=conf,
        imgsz=imgsz,
        distance_enabled=distance_enabled,
        lane_enabled=lane_enabled,
        steering_enabled=steering_enabled,
        center_line_enabled=center_line_enabled,
    )

    # 3) Kembalikan JPEG base64 agar browser tidak perlu menyimpan file hasil ke disk.
    return JSONResponse(
        {
            "model_key": model_key,
            "use_hvi": hvi_applied,
            "hvi_mode": hvi_mode,
            "hvi_applied": hvi_applied,
            "brightness": round(brightness, 2),
            "distance_enabled": distance_enabled,
            "lane_enabled": lane_enabled,
            "steering_enabled": steering_enabled,
            "center_line_enabled": center_line_enabled,
            "annotated_image": _encode_bgr_data_url(result.frame),
            "detections": result.detections,
            "detections_total": len(result.detections),
            "class_counts": dict(result.class_counts),
            "latency_ms": round(result.elapsed_ms, 2),
            "lane_count": result.lane_count,
            "steering_angle": None if result.steering_angle is None else round(result.steering_angle, 2),
        }
    )


@app.post("/detect/image")
async def detect_image(
    file: UploadFile = File(...),
    model_key: str = Form("sknet"),
    use_hvi: bool = Form(False),
    hvi_mode: str = Form("off"),
    distance_enabled: bool = Form(False),
    lane_enabled: bool = Form(False),
    steering_enabled: bool = Form(False),
    center_line_enabled: bool = Form(False),
    conf: float = Form(0.35),
    imgsz: int = Form(640),
) -> JSONResponse:
    return await detect_frame(
        file=file,
        model_key=model_key,
        use_hvi=use_hvi,
        hvi_mode=hvi_mode,
        distance_enabled=distance_enabled,
        lane_enabled=lane_enabled,
        steering_enabled=steering_enabled,
        center_line_enabled=center_line_enabled,
        conf=conf,
        imgsz=imgsz,
    )


@app.post("/detect/video")
def detect_video() -> JSONResponse:
    raise HTTPException(
        status_code=410,
        detail="Video batch output is disabled to avoid accumulating upload/output files. Use /detect/frame for realtime in-memory inference.",
    )
