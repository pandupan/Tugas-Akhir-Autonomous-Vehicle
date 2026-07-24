"""Check cabang perilaku backend yang tidak tercakup oleh compileall."""

import sys
from pathlib import Path


BACKEND_DIRECTORY = Path(__file__).resolve().parents[1] / "backend"
sys.path.insert(0, str(BACKEND_DIRECTORY))

import main  # noqa: E402


def check_hvi_auto_threshold() -> None:
    main._hvi_available = lambda: True

    assert main._resolve_hvi_mode("auto", False, 49.9) == ("auto", True)
    assert main._resolve_hvi_mode("auto", False, 50.0) == ("auto", False)
    assert main._resolve_hvi_mode("off", False, 0.0) == ("off", False)
    assert main._resolve_hvi_mode("on", False, 100.0) == ("on", True)


if __name__ == "__main__":
    check_hvi_auto_threshold()
    print("Backend behavior check lulus.")
