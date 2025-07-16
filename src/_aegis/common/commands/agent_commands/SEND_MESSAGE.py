from typing import override

from _aegis.common.agent_id import AgentID
from ..agent_command import AgentCommand


class SEND_MESSAGE(AgentCommand):
    def __init__(self, agent_id_list: list[AgentID], message: str) -> None:
        self.agent_id_list: list[AgentID] = agent_id_list
        self.message: str = message

    @override
    def __str__(self) -> str:
        return f"{self.STR_SEND_MESSAGE} ( NumTo {len(self.agent_id_list)} , MsgSize {len(self.message)} , ID_List {self.agent_id_list} , MSG {self.message} )"

    @override
    def __repr__(self) -> str:
        return self.__str__()
