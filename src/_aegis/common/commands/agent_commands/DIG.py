from typing import override

from ..agent_command import AgentCommand


class DIG(AgentCommand):
    @override
    def __str__(self) -> str:
        return self.STR_DIG

    @override
    def __repr__(self) -> str:
        return self.__str__()
