from typing import override

from _aegis.common.commands.aegis_command import AegisCommand


class SendMessageResult(AegisCommand):
    def __init__(self, from_agent_id: int, agents: list[int], msg: str) -> None:
        self.from_agent_id: int = from_agent_id
        self.agents: list[int] = agents
        self.msg: str = msg

    @override
    def __str__(self) -> str:
        return (
            f"{self.STR_SEND_MESSAGE_RESULT} ( "
            f"IDFrom ( {self.from_agent_id} ) , "
            f"MsgSize {len(self.msg)} , NUM_TO {len(self.agents)} , "
            f"IDS {self.agents} , MSG {self.msg} )"
        )

    @override
    def __repr__(self) -> str:
        return self.__str__()
