from typing import override

from _aegis.common import AgentID
from _aegis.common.commands.aegis_command import AegisCommand


class SendMessageResult(AegisCommand):
    def __init__(
        self, from_agent_id: AgentID, agent_id_list: list[AgentID], msg: str
    ) -> None:
        self.from_agent_id: AgentID = from_agent_id
        self.agent_id_list: list[AgentID] = agent_id_list
        self.msg: str = msg

    @override
    def __str__(self) -> str:
        return (
            f"{self.STR_SEND_MESSAGE_RESULT} ( "
            f"IDFrom ( {self.from_agent_id.id} , {self.from_agent_id.gid} ) , "
            f"MsgSize {len(self.msg)} , NUM_TO {len(self.agent_id_list)} , "
            f"IDS {self.agent_id_list} , MSG {self.msg} )"
        )

    @override
    def __repr__(self) -> str:
        return self.__str__()
