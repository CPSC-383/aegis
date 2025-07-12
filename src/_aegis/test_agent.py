from __future__ import annotations

import importlib.util
import sys
from collections import deque
from pathlib import Path
from types import ModuleType

import numpy as np
from numpy.typing import NDArray

from _aegis.agent.agent_states import AgentStates
from _aegis.command_manager import CommandManager
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
from _aegis.common.world.info import SurroundInfo
from _aegis.common.world.info.cell_info import CellInfo
from _aegis.common.world.world import World
from _aegis.parsers.aegis_parser import AegisParser


class TestAgent:
    def __init__(self) -> None:
        self._round: int = 0
        self._world: World | None = None
        self._agent_state: AgentStates = AgentStates.CONNECTING
        self._id: AgentID = AgentID(-1, -1)
        self._location: Location = Location(-1, -1)
        self._energy_level: int = -1
        self._prediction_info: deque[
            tuple[int, NDArray[np.float32] | None, NDArray[np.int64] | None]
        ] = deque()
        self._command_manager: CommandManager = CommandManager()
        self._module: ModuleType | None = None

    def get_world(self) -> World | None:
        return self._world

    def set_world(self, world: World) -> None:
        self._world = world

    def run(self) -> None:
        self._round += 1
        if self._module is None:
            raise RuntimeError("Module should not be of `None` type.")
        self._module.main(self).think()  # pyright: ignore[reportAny]

    def load_agent(self, agent_path: str) -> None:
        path = Path(agent_path).resolve()
        if not path.exists():
            raise FileNotFoundError("Agent not found")

        module_name = path.stem

        spec = importlib.util.spec_from_file_location(module_name, str(path))
        if spec is None or spec.loader is None:
            raise ImportError(f"Could not load spec from {path}")

        module = importlib.util.module_from_spec(spec)
        sys.modules[module_name] = module
        spec.loader.exec_module(module)

        if not hasattr(module, "main"):
            raise AttributeError(f"{path} does not define a `main()` function.")

        self._module = module

    def update_surround(self, surround_info: SurroundInfo) -> None:
        world = self.get_world()
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

    def send(self, command: AgentCommand) -> None:
        command.set_agent_id(self.get_agent_id())
        self._command_manager.send(command)

    def end_turn(self) -> None:
        self._command_manager.end_turn()

    def get_commands(self) -> list[AgentCommand]:
        return self._command_manager.get_commands()

    def log(self, message: str) -> None:
        agent_id = self.get_agent_id()
        id_str = f"[Agent#({agent_id.id}:{agent_id.gid})]@{self.get_round_number()}"
        print(f"{id_str}: {message}")

    def handle_aegis_command(self, aegis_command: AegisCommand) -> None:
        if isinstance(aegis_command, CONNECT_OK):
            connect_ok: CONNECT_OK = aegis_command
            self.set_agent_id(connect_ok.new_agent_id)
            self.set_energy_level(connect_ok.energy_level)
            self.set_location(connect_ok.location)
            world = World(AegisParser.build_world(connect_ok.world_filename))
            self.set_world(world)
            self.set_agent_state(AgentStates.CONNECTED)
            self.log("Connected Successfully")

        elif isinstance(aegis_command, DEATH_CARD):
            self.set_agent_state(AgentStates.SHUTTING_DOWN)

        elif isinstance(aegis_command, DISCONNECT):
            self.set_agent_state(AgentStates.SHUTTING_DOWN)

        # elif isinstance(aegis_command, SEND_MESSAGE_RESULT):
        #     if self._brain is not None:
        #         self._brain.handle_send_message_result(aegis_command)

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
            self.update_surround(move_result.surround_info)

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
            self.update_surround(save_surv_result.surround_info)

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
            self.update_surround(team_dig_result.surround_info)

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
