from typing import Any

from .aegis_config import is_feature_enabled


def get_prediction_handler() -> Any:  # noqa: ANN401
    """Get the prediction handler if predictions are enabled."""
    if is_feature_enabled("ENABLE_PREDICTIONS"):
        from .agent_predictions.prediction_handler import (  # noqa: PLC0415
            PredictionHandler,
        )

        return PredictionHandler
    return None


def get_predict_command() -> Any:  # noqa: ANN401
    """Get the predict command if predictions are enabled."""
    if is_feature_enabled("ENABLE_PREDICTIONS"):
        from .common.commands.agent_commands.predict import (  # noqa: PLC0415
            Predict,
        )

        return Predict
    return None


# Check if TensorFlow should be imported
def should_import_tensorflow() -> bool:
    """Check if TensorFlow should be imported based on config."""
    return is_feature_enabled("ENABLE_PREDICTIONS")


# Conditional TensorFlow import
def get_tensorflow() -> Any:  # noqa: ANN401
    """Get TensorFlow if predictions are enabled."""
    if should_import_tensorflow():
        try:
            import tensorflow as tf  # noqa: PLC0415

            return tf  # noqa: TRY300
        except ImportError:
            error = "Tensorflow not available, but predictions are enabled. Not good!"
            raise ImportError(error) from None
    return None
