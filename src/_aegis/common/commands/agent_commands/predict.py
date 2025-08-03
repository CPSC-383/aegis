from typing import Any, override

from _aegis.common.commands.agent_command import AgentCommand


class Predict(AgentCommand):
    def __init__(self, surv_id: int, label: Any) -> None:  # noqa: ANN401
        super().__init__()
        self.surv_id: int = surv_id
        self.label: Any = label

    @override
    def __str__(self) -> str:
        return f"{self.STR_PREDICT} ( SURV_ID {self.surv_id} , LABEL {self.label} )"

    @override
    def __repr__(self) -> str:
        return self.__str__()
