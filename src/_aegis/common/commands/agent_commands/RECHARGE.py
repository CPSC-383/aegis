from typing import override

from ..agent_command import AgentCommand


class RECHARGE(AgentCommand):
    @override
    def __str__(self) -> str:
        return self.STR_RECHARGE

    @override
    def __repr__(self) -> str:
        return self.__str__()
