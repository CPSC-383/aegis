from typing import override

from aegis.common import AgentID, AgentIDList
from aegis.common.commands.aegis_command import AegisCommand


class FWD_MESSAGE(AegisCommand):
    """
    Represents a message that came from another agent.

    Attributes:
        from_agent_id (AgentID): The AgentID of the agent sending the message.
        agent_id_list (AgentIDList): The list of agents who are supposed to receive the message.
        msg (str): The content of the message.
    """

    def __init__(
        self, from_agent_id: AgentID, agent_id_list: AgentIDList, msg: str
    ) -> None:
        """
        Initializes a new FWD_MESSAGE instance.

        Args:
            from_agent_id: The AgentID of the agent sending the message.
            agent_id_list: The list of agents who are supposed to receive the message.
            msg: The content of the message.
        """
        self.from_agent_id = from_agent_id
        self.agent_id_list = agent_id_list
        self.msg = msg
        self._number_left_to_read = agent_id_list.size()

    @override
    def __str__(self) -> str:
        return f"{self.STR_FWD_MESSAGE} ( IDFrom ( {self.from_agent_id.id} , {self.from_agent_id.gid} ) , MsgSize {len(self.msg)} , NUM_TO {self.agent_id_list.size()} , IDS {self.agent_id_list} , MSG {self.msg} )"

    def get_number_left_to_read(self) -> int:
        """Returns the number of recipients who have yet to read the message."""
        return self._number_left_to_read

    def set_number_left_to_read(self, number_left_to_read: int) -> None:
        """
        Sets the number of recipients who have yet to read the message.

        Args:
            number_left_to_read: The new number of recipients left to read the message.
        """
        self._number_left_to_read = number_left_to_read

    def decrease_number_left_to_read(self) -> None:
        """Decreases the number of recipients who have yet to read the message."""
        if self._number_left_to_read <= 0:
            return
        self._number_left_to_read -= 1

    def increase_number_left_to_read(self, number_read_inc: int) -> None:
        """
        Increases the number of recipients who have yet to read the message.

        Args:
            number_read_inc: The amount by which to increase the number of recipients left to read.
        """
        if number_read_inc > 0:
            self._number_left_to_read += number_read_inc
