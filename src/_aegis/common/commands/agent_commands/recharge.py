from typing import override

from _aegis.common.commands.agent_command import AgentCommand


class Recharge(AgentCommand):
    @override
    def __str__(self) -> str:
        return self.STR_RECHARGE

    @override
    def __repr__(self) -> str:
        return self.__str__()
