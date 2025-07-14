from typing import override

import numpy as np
from numpy.typing import NDArray

from _aegis.common.commands.aegis_command import AegisCommand


class SAVE_SURV_RESULT(AegisCommand):
    """
    Represents prediction result data.

    Attributes:
        surv_saved_id (int): The ID of the saved survivor.
        image_to_predict (NDArray[np.float32]): The image to predict.
        all_unique_labels (NDArray[np.int64]): An array of all unique labels for prediction.
    """

    def __init__(
        self,
        surv_saved_id: int,
        image_to_predict: NDArray[np.float32],
        all_unique_labels: NDArray[np.int64],
    ) -> None:
        """
        Initializes a PREDICT_RESULT instance.

        Args:
            surv_saved_id: The ID of the saved survivor.
            image_to_predict: The image to predict.
            all_unique_labels: An array of all unique labels for prediction.
        """
        self.surv_saved_id: int = surv_saved_id
        self.image_to_predict: NDArray[np.float32] = image_to_predict
        self.all_unique_labels: NDArray[np.int64] = all_unique_labels

    @override
    def __str__(self) -> str:
        return f"{self.STR_SAVE_SURV_RESULT} ( SURV_ID {self.surv_saved_id} )"

    @override
    def __repr__(self) -> str:
        return self.__str__()
