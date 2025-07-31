from typing import Any, override

from _aegis.common.commands.aegis_command import AegisCommand


class SaveResult(AegisCommand):
    def __init__(
        self,
        surv_saved_id: int,
        # Type of NDArray[np.float32] | None
        image_to_predict: Any | None = None,  # noqa: ANN401
        # Type of NDArray[np.int64] | None
        all_unique_labels: Any | None = None,  # noqa: ANN401
    ) -> None:
        self.surv_saved_id: int = surv_saved_id
        # Type of NDArray[np.float32] | None
        self.image_to_predict: Any | None = image_to_predict
        # Type of NDArray[np.int64] | None
        self.all_unique_labels: Any | None = all_unique_labels

    @override
    def __str__(self) -> str:
        return f"{self.STR_SAVE_RESULT} ( SURV_ID {self.surv_saved_id} )"

    @override
    def __repr__(self) -> str:
        return self.__str__()
