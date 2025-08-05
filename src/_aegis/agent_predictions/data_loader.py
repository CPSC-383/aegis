import os
from pathlib import Path
from typing import Any

from _aegis.conditional_imports import get_numpy

# Get numpy conditionally
np = get_numpy()


class PredictionDataLoader:
    """Handles loading prediction data from external directories."""

    def __init__(self, testing_for_marking: bool = False) -> None:
        """
        Initialize the data loader.

        Args:
            testing_for_marking: If True, load from marking/ directory instead of student/
        """
        self.testing_for_marking = testing_for_marking
        self._x_test: Any = None
        self._y_test: Any = None
        self._unique_labels: Any = None

    def load_testing_data(self) -> None:
        """Load the appropriate testing data based on marking mode."""
        if self.testing_for_marking:
            data_dir = Path("prediction_data/testing-marking")
        else:
            data_dir = Path("prediction_data/testing")

        x_path = data_dir / "x_test_symbols.npy"
        y_path = data_dir / "y_test_symbols.npy"

        if not x_path.exists() or not y_path.exists():
            raise FileNotFoundError(
                f"Prediction data not found in {data_dir}. "
                f"Expected files: x_test_symbols.npy, y_test_symbols.npy"
            )

        self._x_test = np.load(x_path)
        self._y_test = np.load(y_path)
        self._unique_labels = np.unique(self._y_test)

    def load_training_data(self) -> tuple[Any, Any]:
        """Load training data from the training directory."""
        data_dir = Path("prediction_data/training")
        x_path = data_dir / "x_train_symbols.npy"
        y_path = data_dir / "y_train_symbols.npy"

        if not x_path.exists() or not y_path.exists():
            raise FileNotFoundError(
                f"Training data not found in {data_dir}. "
                f"Expected files: x_train_symbols.npy, y_train_symbols.npy"
            )

        x_train = np.load(x_path)
        y_train = np.load(y_path)
        return x_train, y_train

    @property
    def x_test(self) -> Any:
        """Get the testing images."""
        if self._x_test is None:
            self.load_testing_data()
        return self._x_test

    @property
    def y_test(self) -> Any:
        """Get the testing labels."""
        if self._y_test is None:
            self.load_testing_data()
        return self._y_test

    @property
    def unique_labels(self) -> Any:
        """Get the unique labels."""
        if self._unique_labels is None:
            self.load_testing_data()
        return self._unique_labels

    @property
    def num_testing_images(self) -> int:
        """Get the number of testing images available."""
        return len(self.x_test)
