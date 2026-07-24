# Panduan Kode, Folder Model, dan Persiapan Tanya Jawab

Dokumen ini menjadi peta cepat untuk menjelaskan hubungan antara frontend,
FastAPI, HVI-CIDNet, YOLOv12n, dan SKNet pada proyek `autonomous-vehicle`.

## 1. Identitas dan fokus penelitian

Judul tugas akhir:

> **Pengembangan Model YOLOv12 dengan Selective Kernel Network dan HVI-CIDNet
> untuk Deteksi Objek pada Kendaraan Otonom**

Penelitian menangani dua masalah:

1. Variasi skala objek akibat perbedaan jarak pandang ditangani dengan SKNet.
2. Penurunan kualitas citra low-light ditangani dengan HVI-CIDNet.

Batas penelitian adalah deteksi objek berbasis citra kamera. Jarak, lane, stir,
dan garis objek pada demo merupakan visualisasi post-processing, bukan variabel
yang dilatih atau dievaluasi dalam skripsi.

## 2. Perintah menjalankan aplikasi

Buka dua PowerShell.

### PowerShell pertama — backend

```powershell
cd "C:\Kampus\Project\autonomous-vehicle"
powershell -ExecutionPolicy Bypass -File .\scripts\start-backend.ps1
```

Alamat backend:

- Health check: `http://127.0.0.1:8000/health`
- Swagger/FastAPI docs: `http://127.0.0.1:8000/docs`

### PowerShell kedua — frontend

```powershell
cd "C:\Kampus\Project\autonomous-vehicle"
powershell -ExecutionPolicy Bypass -File .\scripts\start-frontend.ps1
```

Alamat frontend:

- Landing page: `http://localhost:3000`
- Demo deteksi: `http://localhost:3000/demo`
- Komparasi lengkap: `http://localhost:3000/comparison`

## 3. Peta folder yang paling sering ditanyakan

### Frontend

| Lokasi | Fungsi |
| --- | --- |
| `app/page.tsx` | Menentukan urutan section landing page. |
| `app/data/research.ts` | Sumber tunggal judul, pipeline, dataset, kelas, dan angka hasil penelitian. |
| `app/components/Hero.tsx` | Judul dan ringkasan tiga pipeline penelitian. |
| `app/components/Yolo12Section.tsx` | Menjelaskan YOLOv12n sebagai baseline. |
| `app/components/SKNet.tsx` | Menjelaskan posisi dan mekanisme Split–Fuse–Select. |
| `app/components/HVICIDNet.tsx` | Menjelaskan HVI-CIDNet sebagai preprocessing low-light. |
| `app/components/Architecture.tsx` | Menampilkan diagram serta ringkasan metrik E1–E6. |
| `app/components/InferenceStudio.tsx` | Mengambil frame video, mengirim request, dan menampilkan respons. |
| `app/comparison/page.tsx` | Tabel hasil kondisi normal dan low-light. |

Jika angka hasil sidang berubah, ubah `app/data/research.ts`. Jangan mengubah
angka satu per satu di banyak komponen karena dapat menimbulkan ketidaksesuaian.
File `app/Hero.tsx` adalah komponen legacy yang tidak dipanggil oleh
`app/page.tsx`; Hero yang aktif berada di `app/components/Hero.tsx`.

### Sumber gambar arsitektur pada frontend

Seluruh gambar berikut diambil dari aset yang tertanam pada dokumen skripsi
final `227006017_Pandu Pangestu_Bimbingan Tugas Akhir 6.docx`:

| File frontend | Rujukan skripsi | Ditampilkan pada |
| --- | --- | --- |
| `public/images/architecture-general-proposed.png` | Gambar 4.1, arsitektur umum usulan | `Architecture.tsx` |
| `public/images/architecture-yolov12-baseline.png` | Gambar 4.4 (a), YOLOv12n baseline | `Yolo12Section.tsx` |
| `public/images/architecture-yolov12-sknet-final.png` | Gambar 4.4 (b), model usulan | `Architecture.tsx` |
| `public/images/sknet-architecture.png` | Gambar 2.9, mekanisme SKNet | `SKNet.tsx` |
| `public/images/hvi-cidnet-architecture.png` | Gambar 2.13, HVI-CIDNet | `HVICIDNet.tsx` |

### Backend proyek ini

| Lokasi | Fungsi |
| --- | --- |
| `backend/main.py` | Endpoint FastAPI dan urutan HVI → YOLO → respons. |
| `backend/app/config.py` | Membaca `.env`, path weight, device, dan CORS. |
| `backend/app/hvi.py` | Adapter antara FastAPI dan source HVI-CIDNet eksternal. |
| `backend/app/sknet.py` | Definisi `SKAttention` yang dibutuhkan weight SKNet. |
| `backend/app/yolo_service.py` | Registrasi SKAttention, lazy-load YOLO, prediksi, dan anotasi. |
| `backend/.env` | Konfigurasi path runtime lokal; dibuat otomatis oleh launcher. |
| `backend/.env.example` | Template konfigurasi yang aman disimpan di Git. |
| `scripts/validate-backend.py` | Memeriksa semua path model sebelum FastAPI dijalankan. |

Launcher memanggil `validate-backend.py` sebagai file, bukan kode multi-baris
melalui `python -c`. Bentuk ini kompatibel dengan Conda 26 di Windows dan
mencegah error `Support for scripts where arguments contain newlines not implemented`.

### Folder HVI-CIDNet sebenarnya

Ada perbedaan antara **adapter** dan **source model**:

- Adapter aplikasi:
  `C:\Kampus\Project\autonomous-vehicle\backend\app\hvi.py`
- Source arsitektur HVI-CIDNet:
  `C:\Kampus\Project\Fokus Skripsi\Source Code & Eksperimen\src\HVI-CIDNet`
- Kelas utama CIDNet:
  `C:\Kampus\Project\Fokus Skripsi\Source Code & Eksperimen\src\HVI-CIDNet\net\CIDNet.py`
- Transformasi ruang warna HVI:
  `C:\Kampus\Project\Fokus Skripsi\Source Code & Eksperimen\src\HVI-CIDNet\net\HVI_transform.py`
- Weight HVI-CIDNet yang dipakai aplikasi:
  `C:\Kampus\Project\autonomous-vehicle\backend\weights\generalization.pth`
- Salinan sumber weight eksperimen:
  `C:\Kampus\Project\Fokus Skripsi\Source Code & Eksperimen\hvi-cidnet-weight\generalization.pth`

`backend/app/hvi.py` menambahkan folder source HVI ke `sys.path`, mengimpor
`net.CIDNet.CIDNet`, membuat model, lalu memuat `generalization.pth`.

### Folder YOLOv12 dan SKNet sebenarnya

- Service YOLO pada aplikasi:
  `C:\Kampus\Project\autonomous-vehicle\backend\app\yolo_service.py`
- Implementasi SKAttention runtime:
  `C:\Kampus\Project\autonomous-vehicle\backend\app\sknet.py`
- Weight baseline yang dipakai aplikasi:
  `C:\Kampus\Project\autonomous-vehicle\backend\weights\baseline_best.pt`
- Weight model usulan yang dipakai aplikasi:
  `C:\Kampus\Project\autonomous-vehicle\backend\weights\sknet_best.pt`
- Salinan sumber weight eksperimen:
  `C:\Kampus\Project\Fokus Skripsi\Source Code & Eksperimen\weights`
- Repository source/eksperimen YOLOv12 lokal:
  `C:\Kampus\Project\Tugas-Akhir-YOLO12`

Saat aplikasi dijalankan, Python memakai package fork YOLOv12 yang terpasang di
Conda environment `skripsi`. Aplikasi membaca salinan weight lokal dari
`backend/weights`, sedangkan lokasi aslinya tetap terdokumentasi di folder
eksperimen. Path runtime dibaca melalui `backend/.env`.

## 4. Urutan pemanggilan saat tombol Mulai ditekan

```text
Video pada browser
  ↓ capture frame JPEG
app/components/InferenceStudio.tsx
  ↓ POST multipart/form-data
backend/main.py → POST /detect/frame
  ↓ hitung brightness dan pilih mode HVI
backend/app/hvi.py (hanya jika HVI aktif)
  ↓ citra hasil restorasi
backend/app/yolo_service.py
  ↓ YOLOv12n baseline atau weight SKNet
bounding box + class + confidence
  ↓ post-processing overlay opsional
JPEG base64 + metadata JSON
  ↓
InferenceStudio menampilkan layar hasil
```

Penjelasan per tahap:

1. `InferenceStudio.tsx` mengambil satu frame video melalui elemen `canvas`.
2. Frame, model, mode HVI, confidence, dan opsi overlay dikirim ke
   `POST /detect/frame`.
3. `main.py` menghitung rata-rata kanal luminance sebagai nilai brightness.
4. HVI `off` tidak menjalankan enhancer, `on` selalu menjalankan enhancer, dan
   `auto` menjalankan HVI ketika brightness di bawah 82.
5. Jika aktif, `HVIEnhancer.enhance_bgr()` mengubah BGR ke RGB tensor, memuat
   CIDNet, melakukan restorasi, lalu mengembalikan citra BGR.
6. `YoloService.predict_frame()` memilih weight `baseline` atau `sknet`, lalu
   menjalankan `model.predict()`.
7. Hasil YOLO diberi bounding box. Overlay jarak/lane/stir/garis objek hanya
   ditambahkan bila toggle demo diaktifkan.
8. Frame hasil dikirim sebagai JPEG base64. Tidak ada file upload/output yang
   disimpan permanen oleh endpoint realtime.
9. Setelah respons diterima, browser baru mengirim frame berikutnya. Karena itu
   tidak ada batas FPS buatan; kecepatan mengikuti waktu inferensi aktual.

## 5. Mengapa SKAttention harus diregistrasikan?

File `sknet_best.pt` menyimpan referensi kelas Python dengan nama
`ultralytics.nn.modules.sknet.SKAttention`. Sebelum weight dibuka,
`YoloService._register_custom_layers()` memasang kelas dari
`backend/app/sknet.py` ke path tersebut. Tanpa registrasi ini, proses unpickling
dapat gagal karena Python tidak menemukan nama kelas yang tersimpan di weight.

Model dimuat secara lazy: server dapat menyala tanpa langsung memenuhi RAM/GPU,
tetapi request pertama lebih lambat karena weight baru dibaca saat itu.

## 6. Di mana SKNet ditempatkan?

SKAttention berada pada bagian **neck**, bukan backbone. Penempatannya setelah
blok A2C2f pada dua jalur top-down:

- T4 dengan resolusi fitur 40×40.
- T3 dengan resolusi fitur 80×80.

Neck menggabungkan informasi semantik dan spasial dari beberapa skala. Dengan
menjalankan SKAttention setelah fusi, model dapat menyeleksi receptive field
sebelum fitur diteruskan ke agregasi berikutnya dan detection head.

Mekanisme `backend/app/sknet.py`:

1. **Split:** cabang 3×3 biasa dan cabang 3×3 dilasi 2 memproses input sama.
2. **Fuse:** kedua fitur dijumlahkan dan diringkas dengan Global Average Pooling.
3. **Select:** fully connected layer dan Softmax menghasilkan bobot tiap cabang.
4. **Residual scale:** keluaran menjadi `x + alpha × selected`; `alpha` dimulai
   dari 0,01 dan dipelajari ketika training.

Implementasi ini tidak boleh diubah sembarangan karena strukturnya harus cocok
dengan struktur saat `sknet_best.pt` dilatih.

## 7. Apa peran HVI-CIDNet?

HVI-CIDNet adalah unit restorasi citra, bukan model pendeteksi objek. Urutannya:

```text
Citra low-light → HVI-CIDNet → citra restorasi → YOLOv12n/SKNet → deteksi
```

Pada penelitian, HVI digunakan secara eksplisit pada skenario E5 dan E6. Mode
`auto` pada website hanya kemudahan demonstrasi runtime; mode tersebut bukan
skenario evaluasi baru.

## 8. Enam skenario eksperimen

| Skenario | Kondisi | Pipeline |
| --- | --- | --- |
| E1 | Normal | YOLOv12n baseline |
| E2 | Low-light simulasi | YOLOv12n baseline |
| E3 | Normal | YOLOv12n + SKNet |
| E4 | Low-light simulasi | YOLOv12n + SKNet |
| E5 | Low-light direstorasi | HVI-CIDNet → YOLOv12n baseline |
| E6 | Low-light direstorasi | HVI-CIDNet → YOLOv12n + SKNet |

Dataset memakai 7.481 citra KITTI berlabel dengan delapan kelas dan split
80:10:10. Kondisi low-light pada penelitian disimulasikan secara terkontrol
dengan alpha blending `α = 0,2` pada dataset test.

## 9. Angka hasil yang tampil di frontend

Kondisi normal, E1 dibandingkan E3:

| Metrik | Baseline | SKNet | Peningkatan |
| --- | ---: | ---: | ---: |
| Precision | 86,62% | 89,19% | +2,57 poin |
| Recall | 73,02% | 82,04% | +9,02 poin |
| mAP50 | 81,72% | 87,83% | +6,11 poin |
| mAP50–95 | 65,16% | 71,67% | +6,51 poin |

Kondisi low-light, E2 dibandingkan E6:

| Metrik | Baseline low-light | HVI + SKNet | Peningkatan |
| --- | ---: | ---: | ---: |
| Precision | 82,89% | 90,24% | +7,35 poin |
| Recall | 45,32% | 77,56% | +32,24 poin |
| mAP50 | 65,29% | 85,90% | +20,61 poin |
| mAP50–95 | 48,75% | 68,05% | +19,30 poin |

Angka tersebut adalah hasil evaluasi dataset test. Demo video hanya menjalankan
inferensi dan tidak menghitung ulang mAP, precision, atau recall.

## 10. Pertanyaan yang mungkin muncul

### Apakah website ini melatih model?

Tidak. Website hanya melakukan inferensi menggunakan weight terbaik hasil
pelatihan. Training dan eksperimen dilakukan pada notebook/folder eksperimen.

### Mengapa weight tidak berada di repository website?

Weight berukuran besar dan menjadi artefak eksperimen. Path-nya disimpan di
`backend/.env`, sedangkan Git hanya menyimpan `.env.example`.

### Apakah HVI selalu aktif?

Tidak. HVI aktif sesuai pilihan `off`, `auto`, atau `on`. Dalam konteks skripsi,
HVI digunakan pada E5 dan E6 agar perbandingan eksperimen eksplisit.

### Apakah jarak, lane, dan stir adalah kontribusi skripsi?

Tidak. Ketiganya adalah post-processing visual untuk memperkaya demo. Batas
penelitian tidak membahas kontrol atau navigasi kendaraan secara langsung.

### Mengapa request pertama lebih lambat?

Model memakai lazy loading. Weight baru masuk ke RAM/GPU ketika pipeline pertama
kali dipilih; request berikutnya memakai model yang sudah tersimpan di cache.

### Apa yang harus dibuka saat menjelaskan kode?

Urutan yang paling mudah:

1. `app/data/research.ts` untuk konteks dan hasil.
2. `app/components/InferenceStudio.tsx` untuk proses dari browser.
3. `backend/main.py` untuk urutan endpoint.
4. `backend/app/hvi.py` untuk preprocessing.
5. `backend/app/yolo_service.py` untuk pemanggilan YOLO.
6. `backend/app/sknet.py` untuk isi SKAttention.

## 11. Pemeriksaan sebelum presentasi

```powershell
cd "C:\Kampus\Project\autonomous-vehicle"
powershell -ExecutionPolicy Bypass -File .\scripts\verify-project.ps1
```

Setelah backend hidup, buka `http://127.0.0.1:8000/health`. Pastikan
`baseline`, `sknet`, `hvi`, dan `hvi_repo_exists` menunjukkan file/path tersedia.
