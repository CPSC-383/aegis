import importlib.util
from typing import Any

from .aegis_config import is_feature_enabled


def is_prediction_available() -> bool:
    """Check if the prediction system is fully available."""
    if not is_feature_enabled("ENABLE_PREDICTIONS"):
        return False

    return importlib.util.find_spec("numpy") is not None


def get_numpy() -> Any:  # noqa: ANN401
    """Get numpy if available and predictions are enabled."""
    if not is_prediction_available():
        return None

    if importlib.util.find_spec("numpy") is not None:
        import numpy as np  # noqa: PLC0415

        return np
    return None


def get_tensorflow() -> Any:  # noqa: ANN401
    """Get tensorflow if available and predictions are enabled."""
    if not is_prediction_available():
        return None

    if importlib.util.find_spec("tensorflow") is not None:
        import tensorflow as tf  # noqa: PLC0415

        return tf
    return None
