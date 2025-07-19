from abc import ABC

from .command import Command


class AgentCommand(Command, ABC):
    _agent_id: int = -1

    def get_agent_id(self) -> int:
        return self._agent_id

    def set_agent_id(self, agent_id: int) -> None:
        self._agent_id = agent_id
