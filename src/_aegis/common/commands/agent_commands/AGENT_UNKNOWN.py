from typing import override

from _aegis.common.commands.agent_command import AgentCommand


class AGENT_UNKNOWN(AgentCommand):
    """Represents an unknown agent command."""

    @override
    def __str__(self) -> str:
        return self.STR_UNKNOWN
