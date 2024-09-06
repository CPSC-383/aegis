from typing import override

from aegis.common.commands.agent_command import AgentCommand


class SLEEP(AgentCommand):
    """Represents a command for an agent to sleep and recharge energy."""

    @override
    def __str__(self) -> str:
        return self.STR_SLEEP

    @override
    def proc_string(self) -> str:
        return f"{self._agent_id.proc_string()}#Sleep"
