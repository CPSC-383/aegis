from typing import override

from _aegis.common.commands.agent_command import AgentCommand


class RECHARGE(AgentCommand):
    """
    Represents a command for an agent to recharge energy.

    This command must be called on a charging grid.
    """

    @override
    def __str__(self) -> str:
        return self.STR_RECHARGE

    @override
    def proc_string(self) -> str:
        return f"{self._agent_id.proc_string()}#Recharge"
