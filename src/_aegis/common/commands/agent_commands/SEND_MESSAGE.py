from typing import override

from _aegis.common.agent_id import AgentID
from _aegis.common.commands.agent_command import AgentCommand


class SEND_MESSAGE(AgentCommand):
    """
    Represents a command for an agent to send a message to other agents.

    Message is not sent until the beginning of the next round.

    Attributes:
        agent_id_list (list[AgentID]): The list of agents to send a message to.
        message (str): The content of the message.
    """

    def __init__(self, agent_id_list: list[AgentID], message: str) -> None:
        """
        Initializes a SEND_MESSAGE instance.

        Args:
            agent_id_list: The list of agents to send a message to.
            message: The content of the message.
        """
        self.agent_id_list: list[AgentID] = agent_id_list
        self.message: str = message

    @override
    def __str__(self) -> str:
        return f"{self.STR_SEND_MESSAGE} ( NumTo {len(self.agent_id_list)} , MsgSize {len(self.message)} , ID_List {self.agent_id_list} , MSG {self.message} )"

    @override
    def __repr__(self) -> str:
        return self.__str__()
