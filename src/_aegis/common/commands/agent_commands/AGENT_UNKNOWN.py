from typing import override

from ..agent_command import AgentCommand


class AGENT_UNKNOWN(AgentCommand):
    @override
    def __str__(self) -> str:
        return self.STR_UNKNOWN
