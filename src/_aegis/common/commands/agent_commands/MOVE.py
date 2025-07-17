from typing import override

from _aegis.common import Direction
from _aegis.common.commands.agent_command import AgentCommand


class Move(AgentCommand):
    def __init__(self, direction: Direction) -> None:
        self.direction: Direction = direction

    @override
    def __str__(self) -> str:
        return f"{self.STR_MOVE} ( {self.direction} )"

    @override
    def __repr__(self) -> str:
        return self.__str__()
