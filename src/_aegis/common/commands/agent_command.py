from abc import ABC

from .command import Command


class AgentCommand(Command, ABC):
    _id: int = -1

    def get_id(self) -> int:
        return self._id

    def set_id(self, agent_id: int) -> None:
        self._id = agent_id
