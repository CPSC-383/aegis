from typing import override

from _aegis.common.commands.agent_command import AgentCommand


class SendMessage(AgentCommand):
    def __init__(self, agents: list[int], message: str) -> None:
        self.agents: list[int] = agents
        self.message: str = message

    @override
    def __str__(self) -> str:
        return (
            f"{self.STR_SEND_MESSAGE} ( NumTo {len(self.agents)} , "
            f"MsgSize {len(self.message)} , ID_List {self.agents} , "
            f"MSG {self.message} )"
        )

    @override
    def __repr__(self) -> str:
        return self.__str__()
