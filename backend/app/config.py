from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable


BASE_DIR = Path(__file__).resolve().parents[1]

try:
    from dotenv import load_dotenv

    load_dotenv(BASE_DIR / ".env")
except ImportError:
    pass


def _env_path(name: str, default: str) -> Path:
    return Path(os.getenv(name, default)).expanduser()


def _parse_cors(value: str | None) -> list[str]:
    if not value:
        return ["http://localhost:3000", "http://127.0.0.1:3000"]
    return [item.strip() for item in value.split(",") if item.strip()]


def _env_int(name: str, default: int) -> int:
    raw_value = os.getenv(name)
    if raw_value is None:
        return default
    try:
        return int(raw_value)
    except ValueError:
        return default


@dataclass(frozen=True)
class Settings:
    baseline_model_path: Path
    sknet_model_path: Path
    hvi_model_path: Path
    hvi_repo_dir: Path
    hvi_max_dim: int
    inference_device: str
    cors_origins: list[str]

    @classmethod
    def from_env(cls) -> "Settings":
        return cls(
            baseline_model_path=_env_path(
                "BASELINE_MODEL_PATH",
                str(BASE_DIR / "weights" / "baseline_best.pt"),
            ),
            sknet_model_path=_env_path(
                "SKNET_MODEL_PATH",
                str(BASE_DIR / "weights" / "sknet_best.pt"),
            ),
            hvi_model_path=_env_path(
                "HVI_MODEL_PATH",
                str(BASE_DIR / "weights" / "generalization.pth"),
            ),
            hvi_repo_dir=_env_path(
                "HVI_REPO_DIR",
                r"C:\Kampus\Project\Fokus Skripsi\Source Code & Eksperimen\src\HVI-CIDNet",
            ),
            hvi_max_dim=max(128, _env_int("HVI_MAX_DIM", 640)),
            inference_device=os.getenv("INFERENCE_DEVICE", "auto"),
            cors_origins=_parse_cors(os.getenv("CORS_ORIGINS")),
        )

    def model_paths(self) -> Iterable[tuple[str, Path]]:
        yield "baseline", self.baseline_model_path
        yield "sknet", self.sknet_model_path
        yield "hvi", self.hvi_model_path


settings = Settings.from_env()
