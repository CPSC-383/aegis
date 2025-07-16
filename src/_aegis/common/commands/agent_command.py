from abc import ABC, abstractmethod

from _aegis.common import AgentID
from _aegis.common.commands.command import Command


class AgentCommand(Command, ABC):
    """The base class that represents all commands coming from agents."""

    _agent_id: AgentID = AgentID(-1, -1)

    def get_agent_id(self) -> AgentID:
        """Returns the unique AgentID of the agent."""
        return self._agent_id

    def set_agent_id(self, agent_id: AgentID) -> None:
        self._agent_id = agent_id
