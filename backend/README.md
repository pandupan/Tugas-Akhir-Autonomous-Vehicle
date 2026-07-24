# AutoVision FastAPI Backend

Backend ini menjalankan inferensi frame realtime untuk YOLOv12 baseline, YOLOv12 + SKNet, dan opsi preprocessing HVI-CIDNet untuk kondisi low-light.

## Setup lokal

```powershell
cd "C:\Kampus\Project\autonomous-vehicle"
powershell -ExecutionPolicy Bypass -File .\scripts\start-backend.ps1
```

Launcher memakai Conda environment `skripsi`, membuat `.env` dari
`.env.example` jika diperlukan, memeriksa seluruh path model, lalu menjalankan
Uvicorn pada `http://127.0.0.1:8000`.

Frontend membaca API dari `NEXT_PUBLIC_INFERENCE_API_URL`, default-nya `http://localhost:8000`.

## Endpoint

```powershell
POST /detect/frame
```

Form field utama:

```text
file=frame.jpg
model_key=baseline|sknet
hvi_mode=off|auto|on
distance_enabled=true|false
lane_enabled=true|false
steering_enabled=true|false
center_line_enabled=true|false
conf=0.35
imgsz=640
```

Endpoint ini memproses frame di memori dan mengembalikan anotasi base64, jumlah kelas, status HVI adaptif, brightness, estimasi lane, serta sudut simulasi stir.

## Endpoint lain

- `GET /health` untuk status backend dan konfigurasi path model.
- `GET /models` untuk daftar opsi model dan class map KITTI.
- `GET /classes` untuk class map KITTI.
- `GET /demo/kitti-video` untuk proxy video KITTI demo tanpa menyimpan file.
- `POST /detect/image` alias untuk satu gambar/frame.

## Setup manual alternatif

```powershell
cd backend
conda activate skripsi
python -m pip install -r requirements.txt
Copy-Item .env.example .env -ErrorAction SilentlyContinue
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

## Catatan deployment

Gunakan Vercel untuk frontend Next.js. Backend inferensi Python disarankan dideploy terpisah di server yang mendukung PyTorch/OpenCV dan, jika tersedia, GPU. Vercel Python Functions bisa menjalankan FastAPI, tetapi paket PyTorch + model vision biasanya berat dan tidak ideal untuk inferensi realtime.

Peta source HVI-CIDNet, weight YOLO, dan urutan pemanggilan model dijelaskan di
`docs/PANDUAN_KODE_DAN_SKRIPSI.md` pada root proyek.
