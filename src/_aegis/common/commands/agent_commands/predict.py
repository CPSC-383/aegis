from typing import override

import numpy as np

from _aegis.common.commands.agent_command import AgentCommand


class Predict(AgentCommand):
    def __init__(self, surv_id: int, label: np.int64) -> None:
        super().__init__()
        self.surv_id: int = surv_id
        self.label: np.int64 = label

    @override
    def __str__(self) -> str:
        return f"{self.STR_PREDICT} ( SURV_ID {self.surv_id} , LABEL {self.label} )"

    @override
    def __repr__(self) -> str:
        return self.__str__()
