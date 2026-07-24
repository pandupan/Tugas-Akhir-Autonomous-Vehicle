from __future__ import annotations

import sys
import time
import types
from collections import Counter
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import cv2
import numpy as np


KITTI_CLASS_NAMES = {
    0: "car",
    1: "van",
    2: "truck",
    3: "pedestrian",
    4: "person_sitting",
    5: "cyclist",
    6: "tram",
    7: "misc",
}

REAL_OBJECT_HEIGHT_M = {
    0: 1.5,
    1: 2.0,
    2: 3.0,
    3: 1.7,
    4: 1.2,
    5: 1.7,
    6: 3.2,
    7: 1.5,
}


@dataclass
class FrameResult:
    frame: np.ndarray
    detections: list[dict[str, Any]]
    class_counts: Counter[str]
    elapsed_ms: float
    lane_count: int = 0
    steering_angle: float | None = None


class YoloService:
    """Memilih weight baseline/SKNet, menjalankan YOLO, dan menggambar hasil frame."""

    def __init__(self, baseline_path: Path, sknet_path: Path, device: str) -> None:
        self.model_paths = {
            "baseline": baseline_path,
            "sknet": sknet_path,
        }
        self.device_name = device
        self._models: dict[str, Any] = {}

    def _device(self) -> str:
        import torch

        if self.device_name == "auto":
            return "cuda" if torch.cuda.is_available() else "cpu"
        return self.device_name

    @staticmethod
    def _register_custom_layers() -> None:
        """Daftarkan path kelas SKAttention yang tersimpan di dalam weight skripsi."""
        from app.sknet import SKAttention
        import ultralytics.nn.modules as modules
        import ultralytics.nn.tasks as tasks

        setattr(modules, "SKAttention", SKAttention)
        setattr(tasks, "SKAttention", SKAttention)

        sknet_module = types.ModuleType("ultralytics.nn.modules.sknet")
        sknet_module.SKAttention = SKAttention
        sys.modules["ultralytics.nn.modules.sknet"] = sknet_module

    def model_exists(self, model_key: str) -> bool:
        return self.model_paths[model_key].exists()

    def load(self, model_key: str):
        """Lazy-load satu model agar startup API tidak langsung memenuhi RAM/GPU."""
        if model_key not in self.model_paths:
            raise ValueError(f"Unknown model_key '{model_key}'. Use baseline or sknet.")
        if model_key in self._models:
            return self._models[model_key]
        model_path = self.model_paths[model_key]
        if not model_path.exists():
            raise FileNotFoundError(f"Model weight not found: {model_path}")

        self._register_custom_layers()
        from ultralytics import YOLO

        model = YOLO(str(model_path))
        model.to(self._device())
        self._models[model_key] = model
        return model

    def predict_frame(
        self,
        frame_bgr: np.ndarray,
        model_key: str,
        conf: float,
        imgsz: int,
        distance_enabled: bool = False,
        lane_enabled: bool = False,
        steering_enabled: bool = False,
        center_line_enabled: bool = False,
    ) -> FrameResult:
        model = self.load(model_key)
        started = time.perf_counter()
        results = model.predict(frame_bgr, conf=conf, imgsz=imgsz, verbose=False)
        elapsed_ms = (time.perf_counter() - started) * 1000.0

        rendered = frame_bgr.copy()
        detections: list[dict[str, Any]] = []
        class_counts: Counter[str] = Counter()
        lane_count = 0
        lane_angle: float | None = None

        if lane_enabled:
            lane_count, lane_angle = self._draw_lanes(rendered)

        if not results:
            steering_angle = lane_angle if steering_enabled else None
            if steering_enabled:
                self._draw_steering(rendered, steering_angle)
            return FrameResult(rendered, detections, class_counts, elapsed_ms, lane_count, steering_angle)

        result = results[0]
        boxes = getattr(result, "boxes", None)
        if boxes is None:
            steering_angle = lane_angle if steering_enabled else None
            if steering_enabled:
                self._draw_steering(rendered, steering_angle)
            return FrameResult(rendered, detections, class_counts, elapsed_ms, lane_count, steering_angle)

        for box in boxes:
            xyxy = box.xyxy[0].detach().cpu().numpy().astype(int).tolist()
            confidence = float(box.conf[0].detach().cpu().item()) if box.conf is not None else 0.0
            class_id = int(box.cls[0].detach().cpu().item()) if box.cls is not None else -1
            class_name = KITTI_CLASS_NAMES.get(class_id, f"class_{class_id}")
            class_counts[class_name] += 1
            distance_m = self._estimate_distance_m(xyxy, class_id, frame_bgr.shape[1]) if distance_enabled else None

            detection = {
                "class_id": class_id,
                "class_name": class_name,
                "confidence": round(confidence, 4),
                "box": xyxy,
            }
            if distance_m is not None:
                detection["distance_m"] = round(distance_m, 2)
            detections.append(detection)

            if center_line_enabled:
                self._draw_center_line(rendered, xyxy, distance_m)
            self._draw_box(rendered, xyxy, class_name, confidence, model_key, distance_m)

        steering_angle = None
        if steering_enabled:
            steering_angle = lane_angle if lane_angle is not None else self._estimate_steering_from_detections(detections, frame_bgr.shape[1])
            self._draw_steering(rendered, steering_angle)

        return FrameResult(rendered, detections, class_counts, elapsed_ms, lane_count, steering_angle)

    @staticmethod
    def _draw_box(
        frame: np.ndarray,
        xyxy: list[int],
        class_name: str,
        confidence: float,
        model_key: str,
        distance_m: float | None = None,
    ) -> None:
        x1, y1, x2, y2 = xyxy
        color = (45, 212, 191) if model_key == "sknet" else (96, 165, 250)
        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 1)
        label = f"{class_name} {confidence:.2f}"
        if distance_m is not None:
            label = f"{label} | {distance_m:.1f}m"
        (label_w, label_h), baseline = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
        top = max(y1, label_h + baseline + 8)
        cv2.rectangle(frame, (x1, top - label_h - baseline - 8), (x1 + label_w + 8, top), color, -1)
        cv2.putText(
            frame,
            label,
            (x1 + 4, top - baseline - 4),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.5,
            (8, 13, 24),
            1,
            cv2.LINE_AA,
        )

    @staticmethod
    def _estimate_distance_m(xyxy: list[int], class_id: int, frame_width: int) -> float | None:
        x1, y1, x2, y2 = xyxy
        box_height = max(1, y2 - y1)
        real_height = REAL_OBJECT_HEIGHT_M.get(class_id)
        if real_height is None:
            return None

        focal_px = max(480.0, frame_width * 0.9)
        return float((real_height * focal_px) / box_height)

    @staticmethod
    def _draw_center_line(frame: np.ndarray, xyxy: list[int], distance_m: float | None) -> None:
        height, width = frame.shape[:2]
        x1, y1, x2, y2 = xyxy
        origin = (width // 2, height - 18)
        target = ((x1 + x2) // 2, (y1 + y2) // 2)
        color = (14, 165, 233)
        cv2.line(frame, origin, target, color, 1, cv2.LINE_AA)
        cv2.circle(frame, target, 4, color, -1, cv2.LINE_AA)
        if distance_m is not None:
            label = f"{distance_m:.1f}m"
            cv2.putText(
                frame,
                label,
                ((origin[0] + target[0]) // 2 + 6, (origin[1] + target[1]) // 2),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.45,
                color,
                1,
                cv2.LINE_AA,
            )

    @staticmethod
    def _draw_lanes(frame: np.ndarray) -> tuple[int, float | None]:
        height, width = frame.shape[:2]
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        blur = cv2.GaussianBlur(gray, (5, 5), 0)
        edges = cv2.Canny(blur, 70, 150)

        mask = np.zeros_like(edges)
        polygon = np.array(
            [
                [
                    (int(width * 0.08), height),
                    (int(width * 0.42), int(height * 0.58)),
                    (int(width * 0.58), int(height * 0.58)),
                    (int(width * 0.95), height),
                ]
            ],
            dtype=np.int32,
        )
        cv2.fillPoly(mask, polygon, 255)
        cropped_edges = cv2.bitwise_and(edges, mask)

        lines = cv2.HoughLinesP(
            cropped_edges,
            rho=1,
            theta=np.pi / 180,
            threshold=48,
            minLineLength=max(32, width // 12),
            maxLineGap=80,
        )
        if lines is None:
            return 0, None

        selected: list[tuple[int, int, int, int, float]] = []
        for line in lines[:18]:
            x1, y1, x2, y2 = line[0]
            dx = x2 - x1
            dy = y2 - y1
            if dx == 0:
                continue
            slope = dy / dx
            if abs(slope) < 0.35:
                continue
            selected.append((x1, y1, x2, y2, slope))
            cv2.line(frame, (x1, y1), (x2, y2), (52, 211, 153), 2, cv2.LINE_AA)

        if not selected:
            return 0, None

        avg_slope = float(np.mean([item[4] for item in selected]))
        steering_angle = float(np.clip(-avg_slope * 16.0, -28.0, 28.0))
        return len(selected), steering_angle

    @staticmethod
    def _estimate_steering_from_detections(detections: list[dict[str, Any]], frame_width: int) -> float:
        if not detections:
            return 0.0
        centers = [((det["box"][0] + det["box"][2]) / 2.0) for det in detections]
        mean_center = float(np.mean(centers))
        offset = (mean_center - (frame_width / 2.0)) / max(1.0, frame_width / 2.0)
        return float(np.clip(offset * 22.0, -28.0, 28.0))

    @staticmethod
    def _draw_steering(frame: np.ndarray, angle: float | None) -> None:
        height, width = frame.shape[:2]
        angle = 0.0 if angle is None else angle
        panel_w = min(178, max(142, width // 4))
        panel_h = 102
        x0 = 18
        y0 = max(16, height - panel_h - 18)
        x1 = min(width - 18, x0 + panel_w)
        y1 = min(height - 18, y0 + panel_h)

        overlay = frame.copy()
        cv2.rectangle(overlay, (x0, y0), (x1, y1), (15, 23, 42), -1, cv2.LINE_AA)
        cv2.addWeighted(overlay, 0.78, frame, 0.22, 0, frame)
        cv2.rectangle(frame, (x0, y0), (x1, y1), (148, 163, 184), 1, cv2.LINE_AA)

        center = (x0 + 52, y0 + 50)
        radius = 32
        wheel_color = (226, 232, 240)
        accent = (45, 212, 191)
        muted = (148, 163, 184)

        def wheel_point(degrees: float, length: int) -> tuple[int, int]:
            theta = np.deg2rad(degrees + angle)
            return (
                int(center[0] + np.cos(theta) * length),
                int(center[1] + np.sin(theta) * length),
            )

        cv2.circle(frame, center, radius, wheel_color, 4, cv2.LINE_AA)
        cv2.circle(frame, center, radius - 11, muted, 1, cv2.LINE_AA)
        for spoke_angle in (-90, 30, 150):
            cv2.line(frame, center, wheel_point(spoke_angle, radius - 5), wheel_color, 3, cv2.LINE_AA)
        cv2.circle(frame, center, 6, accent, -1, cv2.LINE_AA)
        cv2.circle(frame, wheel_point(-90, radius), 4, accent, -1, cv2.LINE_AA)

        direction = "LEFT" if angle < -2 else "RIGHT" if angle > 2 else "STRAIGHT"
        text_x = x0 + 96
        cv2.putText(
            frame,
            "STEER",
            (text_x, y0 + 34),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.42,
            muted,
            1,
            cv2.LINE_AA,
        )
        cv2.putText(
            frame,
            f"{angle:+.0f} deg",
            (text_x, y0 + 58),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.52,
            wheel_color,
            1,
            cv2.LINE_AA,
        )
        cv2.putText(
            frame,
            direction,
            (text_x, y0 + 80),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.38,
            accent,
            1,
            cv2.LINE_AA,
        )
