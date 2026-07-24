# AutoVision

Website penelitian dan demo inferensi untuk tugas akhir:

> **Pengembangan Model YOLOv12 dengan Selective Kernel Network dan HVI-CIDNet
> untuk Deteksi Objek pada Kendaraan Otonom**

AutoVision menyajikan konteks penelitian, perbandingan hasil eksperimen, dan
demo deteksi video menggunakan YOLOv12 baseline atau YOLOv12 + SKNet. Untuk
kondisi minim cahaya, HVI-CIDNet dapat dijalankan sebagai preprocessing sebelum
frame diteruskan ke detector.

## Fitur

- Landing page penelitian YOLOv12, SKNet, dan HVI-CIDNet.
- Perbandingan metrik eksperimen kondisi normal dan low-light.
- Inferensi video lokal atau simulasi video jalan KITTI.
- Pilihan model YOLOv12 baseline dan YOLOv12 + SKNet.
- Mode HVI-CIDNet `off`, `auto`, atau `on`.
- Respons inferensi seluruhnya di memori tanpa menyimpan frame hasil.
- Overlay demo untuk jarak, batas jalan, stir, dan garis tengah objek.

Overlay tambahan tersebut merupakan visualisasi aplikasi, bukan variabel
evaluasi atau kontribusi utama penelitian.

## Arsitektur aplikasi

```text
Browser
  │ video → frame JPEG
  ▼
Next.js / InferenceStudio
  │ POST /detect/frame
  ▼
FastAPI
  ├─ HVI-CIDNet (opsional/otomatis untuk low-light)
  └─ YOLOv12 baseline atau YOLOv12 + SKNet
       │
       ▼
JSON + anotasi JPEG base64 + metrik inferensi
```

Frontend mengirim frame berikutnya setelah respons sebelumnya selesai. Karena
itu, FPS demo mengikuti waktu inferensi aktual dan tidak dibatasi dengan timer
FPS buatan.

## Teknologi

| Bagian | Teknologi |
| --- | --- |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS, Framer Motion |
| Backend | FastAPI, Uvicorn, OpenCV, NumPy |
| Model | YOLOv12, PyTorch, SKAttention, HVI-CIDNet |
| Dataset penelitian | KITTI |

## Prasyarat

- Node.js 20 atau lebih baru dan npm.
- Conda dengan environment Python bernama `skripsi`.
- Source HVI-CIDNet tersedia secara lokal.
- Model weights ditempatkan di `backend/weights/`.

File weight tidak disimpan di Git karena ukurannya besar. Nama file yang
diharapkan:

```text
backend/weights/baseline_best.pt
backend/weights/sknet_best.pt
backend/weights/generalization.pth
```

## Setup

```powershell
git clone https://github.com/pandupan/Tugas-Akhir-Autonomous-Vehicle.git
cd Tugas-Akhir-Autonomous-Vehicle
npm install
```

Salin konfigurasi backend dan sesuaikan `HVI_REPO_DIR`:

```powershell
Copy-Item .\backend\.env.example .\backend\.env
```

### Menjalankan backend

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\start-backend.ps1
```

Backend tersedia di `http://127.0.0.1:8000` dan dokumentasi Swagger di
`http://127.0.0.1:8000/docs`.

### Menjalankan frontend

Buka PowerShell kedua:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\start-frontend.ps1
```

Frontend tersedia di `http://localhost:3000` dan halaman demo di
`http://localhost:3000/demo`.

## Halaman

| Rute | Fungsi |
| --- | --- |
| `/` | Penjelasan penelitian dan arsitektur model |
| `/comparison` | Perbandingan hasil eksperimen |
| `/demo` | Inferensi video realtime |

## Struktur penting

```text
app/                         frontend Next.js
app/data/research.ts         sumber teks dan angka penelitian
app/components/              landing page dan studio inferensi
backend/main.py              endpoint FastAPI
backend/app/hvi.py           adapter HVI-CIDNet
backend/app/sknet.py         implementasi SKAttention
backend/app/yolo_service.py  pemuatan model, prediksi, dan overlay
docs/                        panduan kode dan konteks skripsi
scripts/                     launcher dan validasi proyek
```

Penjelasan hubungan kode dengan penelitian tersedia di
[`docs/PANDUAN_KODE_DAN_SKRIPSI.md`](docs/PANDUAN_KODE_DAN_SKRIPSI.md).

## Verifikasi

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\verify-project.ps1
```

Pemeriksaan tersebut menjalankan ESLint, production build Next.js, dan
kompilasi kode Python backend.

## Status repository

Project ini masih dalam tahap pengembangan tugas akhir. Setiap progres dibuat
sebagai commit terpisah agar perubahan dapat dibandingkan atau dikembalikan
dengan aman.
