from abc import ABC, abstractmethod
from typing import override


class Command(ABC):
    """Represents a command in AEGIS."""

    STR_END_TURN: str = "END_TURN"
    STR_MOVE: str = "MOVE"
    STR_OBSERVE: str = "OBSERVE"
    STR_SAVE: str = "SAVE"
    STR_PREDICT: str = "PREDICT"
    STR_SEND_MESSAGE: str = "SEND_MESSAGE"
    STR_RECHARGE: str = "RECHARGE"
    STR_DIG: str = "DIG"
    STR_UNKNOWN: str = "UNKNOWN"
    STR_SEND_MESSAGE_RESULT: str = "SEND_MESSAGE_RESULT"
    STR_OBSERVE_RESULT: str = "OBSERVE_RESULT"
    STR_SAVE_SURV_RESULT: str = "SAVE_SURV_RESULT"
    STR_RECHARGE_RESULT: str = "RECHARGE_RESULT"
    STR_WORLD_UPDATE: str = "WORLD_UDPATE"

    @abstractmethod
    @override
    def __str__(self) -> str:
        pass
