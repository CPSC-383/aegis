from typing import override

import numpy as np
from numpy.typing import NDArray

from ..aegis_command import AegisCommand


class SAVE_RESULT(AegisCommand):
    def __init__(
        self,
        surv_saved_id: int,
        image_to_predict: NDArray[np.float32],
        all_unique_labels: NDArray[np.int64],
    ) -> None:
        self.surv_saved_id: int = surv_saved_id
        self.image_to_predict: NDArray[np.float32] = image_to_predict
        self.all_unique_labels: NDArray[np.int64] = all_unique_labels

    @override
    def __str__(self) -> str:
        return f"{self.STR_SAVE_RESULT} ( SURV_ID {self.surv_saved_id} )"

    @override
    def __repr__(self) -> str:
        return self.__str__()
