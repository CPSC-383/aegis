from typing import override

from _aegis.common import AgentID
from _aegis.common.commands.aegis_command import AegisCommand


class SEND_MESSAGE_RESULT(AegisCommand):
    """
    Represents a message that came from another agent.

    Attributes:
        from_agent_id (AgentID): The AgentID of the agent sending the message.
        agent_id_list (list[AgentID]): The list of agents who are supposed to receive the message.
        msg (str): The content of the message.
    """

    def __init__(
        self, from_agent_id: AgentID, agent_id_list: list[AgentID], msg: str
    ) -> None:
        """
        Initializes a new SEND_MESSAGE_RESULT instance.

        Args:
            from_agent_id: The AgentID of the agent sending the message.
            agent_id_list: The list of agents who are supposed to receive the message.
            msg: The content of the message.
        """
        self.from_agent_id: AgentID = from_agent_id
        self.agent_id_list: list[AgentID] = agent_id_list
        self.msg: str = msg

    @override
    def __str__(self) -> str:
        return f"{self.STR_SEND_MESSAGE_RESULT} ( IDFrom ( {self.from_agent_id.id} , {self.from_agent_id.gid} ) , MsgSize {len(self.msg)} , NUM_TO {len(self.agent_id_list)} , IDS {self.agent_id_list} , MSG {self.msg} )"

    @override
    def __repr__(self) -> str:
        return self.__str__()
