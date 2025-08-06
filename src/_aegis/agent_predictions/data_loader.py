from pathlib import Path
from typing import TYPE_CHECKING, cast

import numpy as np

from _aegis.args_parser import Args

if TYPE_CHECKING:
    from numpy.typing import NDArray


class PredictionDataLoader:
    """Handles loading prediction data from external directories."""

    def __init__(self, args: Args) -> None:
        """
        Initialize the data loader.

        Args:
            args: The arguments object

        """
        self.args: Args = args
        self.x_test: NDArray[np.uint8] = np.array([])
        self.y_test: NDArray[np.int32] = np.array([])
        self.unique_labels: NDArray[np.int32] = np.array([])

    def load_testing_data(self) -> None:
        """Load testing data from the testing directory."""
        data_dir = Path("prediction_data/testing")

        x_path = data_dir / "x_test_symbols.npy"
        y_path = data_dir / "y_test_symbols.npy"

        if not x_path.exists() or not y_path.exists():
            msg = (
                f"Prediction data not found in {data_dir}. "
                f"Expected files: x_test_symbols.npy, y_test_symbols.npy"
            )
            raise FileNotFoundError(msg)

        self.x_test = cast("NDArray[np.uint8]", np.load(x_path))
        self.y_test = cast("NDArray[np.int32]", np.load(y_path))
        self.unique_labels = np.unique(self.y_test)

    def load_training_data(self) -> None:
        """Load training data from the training directory."""
        data_dir = Path("prediction_data/training")
        x_path = data_dir / "x_train_symbols.npy"
        y_path = data_dir / "y_train_symbols.npy"

        if not x_path.exists() or not y_path.exists():
            msg = (
                f"Training data not found in {data_dir}. "
                f"Expected files: x_train_symbols.npy, y_train_symbols.npy"
            )
            raise FileNotFoundError(msg)

        x_train = cast("NDArray[np.uint8]", np.load(x_path))
        if x_train.dtype != np.uint8:
            msg = f"Expected uint8 array, got {type(x_train)}"
            raise TypeError(msg)

        y_train = cast("NDArray[np.int32]", np.load(y_path))
        if y_train.dtype != np.int32:
            msg = f"Expected int32 array, got {type(y_train)}"
            raise TypeError(msg)

    @property
    def num_testing_images(self) -> int:
        """Get the number of testing images available."""
        return len(self.x_test)
