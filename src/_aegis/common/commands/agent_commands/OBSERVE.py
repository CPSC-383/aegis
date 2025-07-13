from typing import override

from _aegis.common import Location
from _aegis.common.commands.agent_command import AgentCommand


class OBSERVE(AgentCommand):
    """
    Represents a command for an agent to observe a cell in the world.

    Attributes:
        location (Location): The location to observe.
    """

    def __init__(self, location: Location) -> None:
        """
        Initializes a OBSERVE instance.

        Args:
            location: The location to observe.
        """
        self.location: Location = location

    @override
    def __str__(self) -> str:
        return f"{self.STR_OBSERVE} {self.location}"

    @override
    def __repr__(self) -> str:
        return self.__str__()

    @override
    def proc_string(self) -> str:
        return f"{self._agent_id.proc_string()}#Observe {self.location.proc_string()}"
