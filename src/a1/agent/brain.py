from abc import ABC, abstractmethod

from aegis.common.commands.aegis_command import AegisCommand
from aegis.common.commands.aegis_commands import (
    AEGIS_UNKNOWN,
    CMD_RESULT_END,
    CMD_RESULT_START,
    CONNECT_OK,
    DEATH_CARD,
    DISCONNECT,
    MESSAGES_END,
    MESSAGES_START,
    MOVE_RESULT,
    ROUND_END,
    ROUND_START,
)
from a1.aegis_parser import AegisParser
from aegis.common.world.info.cell_info import CellInfo
from aegis.common.world.world import InternalWorld
from aegis.api import World

import a1.agent.base_agent
from a1.agent.agent_states import AgentStates


class Brain(ABC):
    """Represents the brain of an agent."""

    def __init__(self) -> None:
        """Initializes the Brain instance with no world information."""
        self._world: World | None = None

    def get_world(self) -> World | None:
        """Returns the current world information associated with the brain."""
        return self._world

    @abstractmethod
    def think(self) -> None:
        """
        Contains the logic for the brain to make decisions based
        on the current state of the world.
        """
        pass

    def handle_aegis_command(self, aegis_command: AegisCommand) -> None:
        """
        Processes a command received from AEGIS.

        Args:
            aegis_command: The command received from AEGIS.
        """
        base_agent = a1.agent.base_agent.BaseAgent.get_agent()
        if isinstance(aegis_command, CONNECT_OK):
            connect_ok: CONNECT_OK = aegis_command
            base_agent.set_agent_id(connect_ok.new_agent_id)
            base_agent.set_energy_level(connect_ok.energy_level)
            base_agent.set_location(connect_ok.location)
            self._world = InternalWorld(
                AegisParser.build_world(connect_ok.world_filename)
            )  # pyright: ignore[reportAttributeAccessIssue]
            base_agent.set_agent_state(AgentStates.CONNECTED)
            base_agent.log("Connected Successfully")

        elif isinstance(aegis_command, DEATH_CARD):
            base_agent.set_agent_state(AgentStates.SHUTTING_DOWN)
        elif isinstance(aegis_command, DISCONNECT):
            base_agent.set_agent_state(AgentStates.SHUTTING_DOWN)

        elif isinstance(aegis_command, MESSAGES_END):
            base_agent.set_agent_state(AgentStates.IDLE)

        elif isinstance(aegis_command, MESSAGES_START):
            base_agent.set_agent_state(AgentStates.READ_MAIL)

        elif isinstance(aegis_command, MOVE_RESULT):
            move_result: MOVE_RESULT = aegis_command
            move_result_current_info: CellInfo = (
                move_result.surround_info.get_current_info()
            )
            base_agent.set_energy_level(move_result.energy_level)
            base_agent.set_location(move_result_current_info.location)
            base_agent.update_surround(move_result.surround_info, self.get_world())  # pyright: ignore[reportArgumentType]

        elif isinstance(aegis_command, ROUND_END):
            base_agent.set_agent_state(AgentStates.IDLE)

        elif isinstance(aegis_command, ROUND_START):
            base_agent.set_agent_state(AgentStates.THINK)

        elif isinstance(aegis_command, AEGIS_UNKNOWN):
            base_agent.log("Brain: Got Unknown command reply from AEGIS.")

        elif isinstance(aegis_command, CMD_RESULT_START):
            base_agent.set_agent_state(AgentStates.GET_CMD_RESULT)

        elif isinstance(aegis_command, CMD_RESULT_END):
            base_agent.set_agent_state(AgentStates.IDLE)

        else:
            base_agent.log(
                f"Brain: Got unrecognized reply from AEGIS: {aegis_command.__class__.__name__}.",
            )
