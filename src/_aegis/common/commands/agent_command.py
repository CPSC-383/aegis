from abc import ABC

from ..agent_id import AgentID
from .command import Command


class AgentCommand(Command, ABC):
    _agent_id: AgentID = AgentID(-1, -1)

    def get_agent_id(self) -> AgentID:
        return self._agent_id

    def set_agent_id(self, agent_id: AgentID) -> None:
        self._agent_id = agent_id
