from __future__ import annotations

import sys
from collections import deque

import numpy as np
from numpy.typing import NDArray

from _aegis.agent.agent_states import AgentStates
from _aegis.agent.brain import Brain
from _aegis.common import AgentID, Direction, Location
from _aegis.common.commands.aegis_command import AegisCommand
from _aegis.common.commands.aegis_commands import (
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
    SAVE_SURV_RESULT,
    SEND_MESSAGE_RESULT,
    SLEEP_RESULT,
    TEAM_DIG_RESULT,
)
from _aegis.common.commands.agent_command import AgentCommand
from _aegis.common.commands.agent_commands import CONNECT, END_TURN
from _aegis.common.network.aegis_socket import AegisSocket
from _aegis.common.network.aegis_socket_exception import AegisSocketException
from _aegis.common.parsers.aegis_parser_exception import AegisParserException
from _aegis.common.world.info import SurroundInfo
from _aegis.common.world.info.cell_info import CellInfo
from _aegis.common.world.world import World
from _aegis.mas.aegis_parser import AegisParser


class BaseAgent:
    """Represents a base agent that connects to and interacts with AEGIS."""

    AGENT_PORT: int = 6001
    _agent: BaseAgent | None = None

    def __init__(self) -> None:
        """Initializes a BaseAgent instance."""
        self._round: int = 0
        self._agent_state: AgentStates = AgentStates.CONNECTING
        self._id: AgentID = AgentID(-1, -1)
        self._location: Location = Location(-1, -1)
        self._brain: Brain | None = None
        self._energy_level: int = -1
        self._aegis_socket: AegisSocket | None = None
        self._prediction_info: deque[
            tuple[int, NDArray[np.float32] | None, NDArray[np.int64] | None]
        ] = deque()
        self._did_end_turn: bool = False

    @staticmethod
    def get_agent() -> BaseAgent:
        if BaseAgent._agent is None:
            BaseAgent._agent = BaseAgent()
        return BaseAgent._agent

    def update_surround(self, surround_info: SurroundInfo, world: World | None) -> None:
        if world is None:
            return

        for dir in Direction:
            cell_info = surround_info.get_surround_info(dir)
            if cell_info is None:
                continue

            cell = world.get_cell_at(cell_info.location)
            if cell is None:
                continue

            cell.agent_id_list = cell_info.agent_id_list
            cell.move_cost = cell_info.move_cost
            cell.set_top_layer(cell_info.top_layer)
            if cell_info.top_layer is None and cell.has_survivors:
                cell.has_survivors = False

    def set_agent_state(self, agent_state: AgentStates) -> None:
        self._agent_state = agent_state

        if agent_state == AgentStates.READ_MAIL:
            self._round += 1

        self.log(f"New State: {self._agent_state}")

    def get_agent_state(self) -> AgentStates:
        return self._agent_state

    def get_round_number(self) -> int:
        return self._round

    def get_agent_id(self) -> AgentID:
        return self._id

    def set_agent_id(self, id: AgentID) -> None:
        self._id = id
        self.log(f"New ID: {self._id}")

    def get_location(self) -> Location:
        return self._location

    def set_location(self, location: Location) -> None:
        self._location = location
        self.log(f"New Location: {self._location}")

    def get_energy_level(self) -> int:
        return self._energy_level

    def set_energy_level(self, energy_level: int) -> None:
        self._energy_level = energy_level
        self.log(f"New Energy: {self._energy_level}")

    def get_prediction_info_size(self) -> int:
        return len(self._prediction_info)

    def get_prediction_info(
        self,
    ) -> tuple[int, NDArray[np.float32] | None, NDArray[np.int64] | None]:
        if len(self._prediction_info) == 0:
            return -1, None, None
        return self._prediction_info.popleft()

    def add_prediction_info(
        self,
        prediction_info: tuple[
            int, NDArray[np.float32] | None, NDArray[np.int64] | None
        ],
    ) -> None:
        self._prediction_info.append(prediction_info)
        self.log("New Prediction Info!")

    def clear_prediction_info(self) -> None:
        self._prediction_info.clear()
        self.log("Cleared Prediction Info")

    def get_brain(self) -> Brain | None:
        return self._brain

    def set_brain(self, brain: Brain) -> None:
        self._brain = brain
        self.log("New Brain")

    def start(
        self,
        group_name: str,
        brain: Brain,
        host: str = "localhost",
    ) -> None:
        if self._agent_state == AgentStates.CONNECTING:
            self.set_brain(brain)
            if self._connect_to_aegis(host, group_name):
                self._run_base_agent_states()
            else:
                self.log("Failed to connect to AEGIS.")
        else:
            self.log("Multiple calls made to start method, ( call ignored )")

    def _connect_to_aegis(self, host: str, group_name: str) -> bool:
        result: bool = False
        for _ in range(5):
            self.log("Trying to connect to AEGIS...")
            try:
                self._aegis_socket = AegisSocket()
                self._aegis_socket.connect(host, self.AGENT_PORT)
                self._aegis_socket.send_message(str(CONNECT(group_name)))
                message = self._aegis_socket.read_message()
                if message is not None:
                    self.handle_aegis_command(AegisParser.parse_aegis_command(message))
                if self.get_agent_state() == AgentStates.CONNECTED:
                    result = True
            except AegisParserException as e:
                print(f"Can't parse/find WorldInfoFile.out -> {e}")
                sys.exit(1)
            except AegisSocketException as e:
                print(f"Can't connect to AEGIS -> {e}")
                sys.exit(1)
            if result:
                break
            else:
                self.log("Failed to connect")
        if result:
            self.log("Connected")
        _ = sys.stdout.flush()
        return result

    def _run_base_agent_states(self) -> None:
        end: bool = False
        while not end:
            try:
                aegis_socket = self._aegis_socket
                if aegis_socket is not None:
                    message = aegis_socket.read_message()
                    try:
                        if message is not None:
                            aegis_command = AegisParser.parse_aegis_command(message)
                            self.handle_aegis_command(aegis_command)
                            agent_state = self._agent_state
                            if agent_state == AgentStates.THINK:
                                if self._brain is not None:
                                    self._brain.think()
                                self._did_end_turn = False
                            elif agent_state == AgentStates.SHUTTING_DOWN:
                                end = True
                    except AegisParserException as e:
                        self.log(
                            f"Got AegisParserException '{e}'",
                        )
            except AegisSocketException as e:
                self.log(f"Got AegisSocketException '{e}', shutting down.")
                end = True
            _ = sys.stdout.flush()

        if self._aegis_socket is not None:
            self._aegis_socket.disconnect()

    def send(self, agent_action: AgentCommand) -> None:
        if self._aegis_socket is not None and not self._did_end_turn:
            try:
                self._aegis_socket.send_message(str(agent_action))
                if isinstance(agent_action, END_TURN):
                    self._did_end_turn = True
            except AegisSocketException:
                self.log(f"Failed to send {agent_action}")

    def log(self, message: str) -> None:
        agent = self.get_agent()
        agent_id = agent.get_agent_id()
        id_str = f"[Agent#({agent_id.id}:{agent_id.gid})]@{agent.get_round_number()}"
        print(f"{id_str}: {message}")

    def handle_aegis_command(self, aegis_command: AegisCommand) -> None:
        """
        Processes a command received from AEGIS.

        Args:
            aegis_command: The command received from AEGIS.
        """
        if isinstance(aegis_command, CONNECT_OK):
            connect_ok: CONNECT_OK = aegis_command
            self.set_agent_id(connect_ok.new_agent_id)
            self.set_energy_level(connect_ok.energy_level)
            self.set_location(connect_ok.location)
            world = World(AegisParser.build_world(connect_ok.world_filename))
            if self._brain is not None:
                self._brain.set_world(world)
            self.set_agent_state(AgentStates.CONNECTED)
            self.log("Connected Successfully")

        elif isinstance(aegis_command, DEATH_CARD):
            self.set_agent_state(AgentStates.SHUTTING_DOWN)

        elif isinstance(aegis_command, DISCONNECT):
            self.set_agent_state(AgentStates.SHUTTING_DOWN)

        elif isinstance(aegis_command, SEND_MESSAGE_RESULT):
            if self._brain is not None:
                self._brain.handle_send_message_result(aegis_command)

        elif isinstance(aegis_command, MESSAGES_END):
            self.set_agent_state(AgentStates.IDLE)

        elif isinstance(aegis_command, MESSAGES_START):
            self.set_agent_state(AgentStates.READ_MAIL)

        elif isinstance(aegis_command, MOVE_RESULT):
            move_result: MOVE_RESULT = aegis_command
            move_result_current_info: CellInfo = (
                move_result.surround_info.get_current_info()
            )
            self.set_energy_level(move_result.energy_level)
            self.set_location(move_result_current_info.location)
            if self._brain is not None:
                self.update_surround(move_result.surround_info, self._brain.get_world())

        elif isinstance(aegis_command, ROUND_END):
            self.set_agent_state(AgentStates.IDLE)

        elif isinstance(aegis_command, ROUND_START):
            self.set_agent_state(AgentStates.THINK)

        elif isinstance(aegis_command, SAVE_SURV_RESULT):
            save_surv_result: SAVE_SURV_RESULT = aegis_command
            save_surv_result_current_info = (
                save_surv_result.surround_info.get_current_info()
            )
            self.set_energy_level(save_surv_result.energy_level)
            self.set_location(save_surv_result_current_info.location)
            if save_surv_result.has_pred_info():
                surv_id, image, labels = (
                    save_surv_result.surv_saved_id,
                    save_surv_result.image_to_predict,
                    save_surv_result.all_unique_labels,
                )
                self.add_prediction_info((surv_id, image, labels))

            # self.handle_save_surv_result(save_surv_result)
            if self._brain is not None:
                self.update_surround(
                    save_surv_result.surround_info, self._brain.get_world()
                )

        # elif isinstance(aegis_command, PREDICT_RESULT):
        #     pred_req: PREDICT_RESULT = aegis_command
        #     self.handle_predict_result(pred_req)

        elif isinstance(aegis_command, SLEEP_RESULT):
            sleep_result: SLEEP_RESULT = aegis_command
            if sleep_result.was_successful:
                self.set_energy_level(sleep_result.charge_energy)
        # elif isinstance(aegis_command, OBSERVE_RESULT):
        #     ovr: OBSERVE_RESULT = aegis_command
        #     self.handle_observe_result(ovr)

        elif isinstance(aegis_command, TEAM_DIG_RESULT):
            team_dig_result: TEAM_DIG_RESULT = aegis_command
            team_dig_result_current_info: CellInfo = (
                team_dig_result.surround_info.get_current_info()
            )
            self.set_energy_level(team_dig_result.energy_level)
            self.set_location(team_dig_result_current_info.location)
            if self._brain is not None:
                self.update_surround(
                    team_dig_result.surround_info, self._brain.get_world()
                )

        elif isinstance(aegis_command, AEGIS_UNKNOWN):
            self.log("Brain: Got Unknown command reply from AEGIS.")

        elif isinstance(aegis_command, CMD_RESULT_START):
            self.set_agent_state(AgentStates.GET_CMD_RESULT)

        elif isinstance(aegis_command, CMD_RESULT_END):
            self.set_agent_state(AgentStates.IDLE)

        else:
            self.log(
                f"Brain: Got unrecognized reply from AEGIS: {aegis_command.__class__.__name__}.",
            )
