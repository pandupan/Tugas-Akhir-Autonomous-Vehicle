from __future__ import annotations

import sys
from contextlib import nullcontext
from pathlib import Path

import cv2
import numpy as np


class HVIEnhancer:
    """Adapter yang memuat source CIDNet eksternal dan menerapkannya pada frame BGR."""

    def __init__(self, repo_dir: Path, weight_path: Path, device: str, max_dim: int = 640) -> None:
        self.repo_dir = repo_dir
        self.weight_path = weight_path
        self.device_name = device
        self.max_dim = max_dim
        self._model = None
        self._device_obj = None

    def _device(self):
        import torch

        if self._device_obj is not None:
            return self._device_obj
        if self.device_name == "auto":
            self._device_obj = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        else:
            self._device_obj = torch.device(self.device_name)
        return self._device_obj

    def _load_model(self):
        """Muat arsitektur dan weight sekali, lalu gunakan cache untuk request berikutnya."""
        import torch

        if self._model is not None:
            return self._model
        if not self.repo_dir.exists():
            raise FileNotFoundError(f"HVI-CIDNet repo directory not found: {self.repo_dir}")
        if not self.weight_path.exists():
            raise FileNotFoundError(f"HVI-CIDNet weight not found: {self.weight_path}")

        repo_str = str(self.repo_dir)
        if repo_str not in sys.path:
            sys.path.insert(0, repo_str)

        from net.CIDNet import CIDNet  # type: ignore

        device = self._device()
        model = CIDNet().to(device)
        checkpoint = torch.load(str(self.weight_path), map_location=device)
        if isinstance(checkpoint, dict):
            state_dict = (
                checkpoint.get("state_dict")
                or checkpoint.get("model")
                or checkpoint.get("params")
                or checkpoint
            )
        else:
            state_dict = checkpoint
        model.load_state_dict(state_dict, strict=True)
        model.eval()

        if hasattr(model, "trans"):
            model.trans.gated2 = True
            model.trans.alpha = 1.0

        if device.type == "cuda":
            torch.backends.cudnn.benchmark = True

        self._model = model
        return model

    def enhance_bgr(self, frame_bgr: np.ndarray, gamma: float = 1.0) -> np.ndarray:
        """Ubah frame OpenCV BGR menjadi tensor RGB, jalankan CIDNet, lalu kembalikan BGR."""
        import torch

        model = self._load_model()
        device = self._device()

        original_height, original_width = frame_bgr.shape[:2]
        working_frame = self._resize_for_hvi(frame_bgr)
        height, width = working_frame.shape[:2]
        # CIDNet memerlukan ukuran yang kompatibel dengan downsampling internalnya.
        pad_h = (64 - height % 64) % 64
        pad_w = (64 - width % 64) % 64
        padded = cv2.copyMakeBorder(working_frame, 0, pad_h, 0, pad_w, cv2.BORDER_REFLECT)

        rgb = cv2.cvtColor(padded, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0
        tensor = torch.from_numpy(rgb).permute(2, 0, 1).unsqueeze(0).to(device)
        tensor = tensor.clamp(0, 1) ** gamma

        autocast_context = torch.autocast(device_type="cuda") if device.type == "cuda" else nullcontext()
        with torch.inference_mode(), autocast_context:
            output = model(tensor)
            if isinstance(output, (tuple, list)):
                output = output[0]
            output = output.clamp(0, 1)

        enhanced = output.squeeze(0).permute(1, 2, 0).detach().cpu().numpy()
        enhanced = (enhanced * 255.0).round().astype(np.uint8)
        enhanced_bgr = cv2.cvtColor(enhanced, cv2.COLOR_RGB2BGR)
        enhanced_bgr = enhanced_bgr[:height, :width]
        if (height, width) != (original_height, original_width):
            enhanced_bgr = cv2.resize(enhanced_bgr, (original_width, original_height), interpolation=cv2.INTER_LINEAR)
        return enhanced_bgr

    def _resize_for_hvi(self, frame_bgr: np.ndarray) -> np.ndarray:
        height, width = frame_bgr.shape[:2]
        max_side = max(height, width)
        if max_side <= self.max_dim:
            return frame_bgr
        scale = self.max_dim / max_side
        next_width = max(1, int(round(width * scale)))
        next_height = max(1, int(round(height * scale)))
        return cv2.resize(frame_bgr, (next_width, next_height), interpolation=cv2.INTER_AREA)
