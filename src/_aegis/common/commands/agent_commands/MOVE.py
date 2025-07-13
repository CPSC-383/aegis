from typing import override

from _aegis.common import Direction
from _aegis.common.commands.agent_command import AgentCommand


class MOVE(AgentCommand):
    """
    Represents a command for an agent to move in a specified direction.

    Examples:
        >>> dir = Direction.EAST
        >>> MOVE(dir)
        MOVE ( EAST )


    Attributes:
        direction (Direction): The direction to move.
    """

    def __init__(self, direction: Direction) -> None:
        """
        Initializes a MOVE instance.

        Args:
            direction: The direction to move.
        """
        self.direction: Direction = direction

    @override
    def __str__(self) -> str:
        return f"{self.STR_MOVE} ( {self.direction} )"

    @override
    def __repr__(self) -> str:
        return self.__str__()

    @override
    def proc_string(self) -> str:
        return f"{self._agent_id.proc_string()}#Move {self.direction}"
