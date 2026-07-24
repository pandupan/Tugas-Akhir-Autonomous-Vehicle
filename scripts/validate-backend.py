"""Memeriksa seluruh path model sebelum FastAPI dijalankan.

File terpisah ini sengaja digunakan karena Conda 26 pada Windows tidak dapat
menjalankan argumen ``python -c`` yang berisi baris baru. Exit code 1 berarti
setidaknya ada path pada ``backend/.env`` yang belum ditemukan.
"""

import sys
from pathlib import Path


# Saat sebuah file Python dijalankan lewat path absolut, folder file tersebut
# menjadi lokasi import utama. Tambahkan `backend` agar package `app` dikenali
# tanpa bergantung pada working directory yang dipilih oleh Conda.
BACKEND_DIRECTORY = Path(__file__).resolve().parents[1] / "backend"
sys.path.insert(0, str(BACKEND_DIRECTORY))

from app.config import settings  # noqa: E402  (diimpor setelah sys.path siap)


def main() -> int:
    """Tampilkan status setiap weight/repository dan kembalikan exit code."""
    required_paths = list(settings.model_paths()) + [
        ("hvi_repo", settings.hvi_repo_dir),
    ]
    missing_paths = []

    for name, path in required_paths:
        exists = path.exists()
        status = "OK" if exists else "TIDAK DITEMUKAN"
        print(f"[{status}] {name}: {path}")
        if not exists:
            missing_paths.append(path)

    return 1 if missing_paths else 0


if __name__ == "__main__":
    raise SystemExit(main())
