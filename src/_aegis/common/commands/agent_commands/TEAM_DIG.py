from typing import override

from _aegis.common.commands.agent_command import AgentCommand


class TEAM_DIG(AgentCommand):
    """
    Represents a command for an agent to dig rubble.

    If a piece of rubble needs more then one agent to remove it then
    all the needed agents need to move onto the cell and send the
    TEAM_DIG command during the same round.
    """

    @override
    def __str__(self) -> str:
        return self.STR_TEAM_DIG

    @override
    def __repr__(self) -> str:
        return self.__str__()
