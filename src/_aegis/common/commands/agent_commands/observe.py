from typing import override

from _aegis.common import Location
from _aegis.common.commands.agent_command import AgentCommand


class Observe(AgentCommand):
    def __init__(self, location: Location) -> None:
        self.location: Location = location

    @override
    def __str__(self) -> str:
        return f"{self.STR_OBSERVE} {self.location}"

    @override
    def __repr__(self) -> str:
        return self.__str__()
