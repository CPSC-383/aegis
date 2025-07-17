import importlib.util
import sys
from pathlib import Path
from typing import TYPE_CHECKING

from . import LOGGER
from .command_manager import CommandManager
from .common import AgentID, Direction, Location
from .common.commands.aegis_command import AegisCommand
from .common.commands.aegis_commands import (
    ObserveResult,
    RechargeResult,
    SendMessageResult,
    WorldUpdate,
)
from .common.commands.agent_command import AgentCommand
from .common.commands.agent_commands import SendMessage
from .common.world.cell import Cell
from .common.world.info import SurroundInfo
from .common.world.world import World

if TYPE_CHECKING:
    from types import ModuleType

try:
    from _aegis.common.commands.aegis_commands.save_result import SaveResult
except ImportError:
    SaveResult = None


class Agent:
    def __init__(  # noqa: PLR0913
        self,
        world: World,
        aegis_world: World,
        agent_id: AgentID,
        location: Location,
        energy_level: int,
        *,
        debug: bool,
    ) -> None:
        self._round: int = 0
        self._world: World = world
        self._aegis_world: World = aegis_world
        self._id: AgentID = agent_id
        self._location: Location = location
        self._energy_level: int = energy_level
        self._command_manager: CommandManager = CommandManager()
        self._module: ModuleType | None = None
        self._inbox: list[SendMessageResult] = []
        self._results: list[AegisCommand] = []
        self.steps_taken: int = 0
        self._debug: bool = debug

    def run(self) -> None:
        self._round += 1
        if self._module is None:
            error = "Module should not be of `None` type."
            raise RuntimeError(error)
        self._send_messages()
        self._send_results()
        self._module.think()  # pyright: ignore[reportAny]

    def _send_results(self) -> None:
        if self._results and self._module:
            for result in self._results:
                if isinstance(result, ObserveResult) and hasattr(
                    self._module,
                    "handle_observe",
                ):
                    self._module.handle_observe(self, result)  # pyright: ignore[reportAny]

                elif (
                    SaveResult is not None
                    and isinstance(result, SaveResult)
                    and hasattr(self._module, "handle_save")
                ):
                    self._module.handle_save(self, result)  # pyright: ignore[reportAny]
        self._results.clear()

    def _send_messages(self) -> None:
        if self._inbox and self._module and hasattr(self._module, "handle_messages"):
            self._module.handle_messages(self, self._inbox)  # pyright: ignore[reportAny]
        self._inbox.clear()

    def load_agent(self, agent_path: str) -> None:
        path = Path(agent_path).resolve()
        if not path.exists():
            error = "Agent not found"
            raise FileNotFoundError(error)

        module_name = path.stem

        spec = importlib.util.spec_from_file_location(module_name, str(path))
        if spec is None or spec.loader is None:
            error = f"Could not load spec from {path}"
            raise ImportError(error)

        module = importlib.util.module_from_spec(spec)
        sys.modules[module_name] = module
        spec.loader.exec_module(module)

        # This must be injected after spec.loader, or else all these methods won't
        # exist in the agent
        module.__dict__.update(self.create_methods())

        if not hasattr(module, "think"):
            error = f"{path} does not define a `think()` function."
            raise AttributeError(error)

        self._module = module

    def update_surround(self, surround_info: SurroundInfo) -> None:
        for d in Direction:
            cell_info = surround_info.get_surround_info(d)
            if cell_info is None:
                continue

            cell = self._world.get_cell_at(cell_info.location)
            if cell is None:
                continue

            cell.agent_id_list = cell_info.agent_id_list
            cell.move_cost = cell_info.move_cost
            cell.set_top_layer(cell_info.top_layer)

    def set_location(self, location: Location) -> None:
        self._location = location
        self.log(f"New Location: {self._location}")

    def set_energy_level(self, energy_level: int) -> None:
        self._energy_level = energy_level
        self.log(f"New Energy: {self._energy_level}")

    def get_action_command(self) -> AgentCommand | None:
        return self._command_manager.get_action_command()

    def get_directives(self) -> list[AgentCommand]:
        return self._command_manager.get_directives()

    def get_messages(self) -> list[SendMessage]:
        return self._command_manager.get_messages()

    def handle_aegis_command(self, aegis_command: AegisCommand) -> None:
        if isinstance(aegis_command, SendMessageResult):
            self._inbox.append(aegis_command)
        elif isinstance(aegis_command, WorldUpdate):
            move_result = aegis_command
            curr_info = move_result.surround_info.get_current_info()
            self.set_energy_level(move_result.energy_level)
            self.set_location(curr_info.location)
            self.update_surround(move_result.surround_info)
        elif SaveResult is not None and isinstance(aegis_command, SaveResult):
            self._results.append(aegis_command)
        elif isinstance(aegis_command, RechargeResult):
            recharge_result: RechargeResult = aegis_command
            if recharge_result.was_successful:
                self.set_energy_level(recharge_result.charge_energy)
        elif isinstance(aegis_command, ObserveResult):
            self._results.append(aegis_command)
        else:
            LOGGER.warning(
                "Got unrecognized reply from AEGIS: ",
                f"{aegis_command.__class__.__name__}.",
            )

    def add_energy(self, energy: int) -> None:
        if energy >= 0:
            self._energy_level += energy

    def remove_energy(self, energy: int) -> None:
        if energy < self._energy_level:
            self._energy_level -= energy
        else:
            self._energy_level = 0

    def add_step_taken(self) -> None:
        self.steps_taken += 1

    def create_methods(self):  # noqa: ANN202
        return {
            "get_round_number": self.get_round_number,
            "get_agent_id": self.get_agent_id,
            "get_location": self.get_location,
            "get_energy_level": self.get_energy_level,
            "send": self.send,
            "on_map": self.on_map,
            "get_cell_at": self.get_cell_at,
            "get_energy_cells": self._world.get_energy_cells,
            "get_survs": self._aegis_world.get_survs,
            "log": self.log,
        }

    ###################################
    # ===== Public User Methods ===== #
    ###################################

    def get_round_number(self) -> int:
        return self._round

    def get_agent_id(self) -> AgentID:
        return self._id

    def get_location(self) -> Location:
        return self._location

    def get_energy_level(self) -> int:
        return self._energy_level

    def send(self, command: AgentCommand) -> None:
        command.set_agent_id(self.get_agent_id())
        self._command_manager.send(command)

    def on_map(self, loc: Location) -> bool:
        return self._world.on_map(loc)

    def get_cell_at(self, loc: Location) -> Cell | None:
        return self._world.get_cell_at(loc)

    def log(self, *args: object) -> None:
        if not self._debug:
            return

        agent_id = self.get_agent_id()
        print(  # noqa: T201
            f"[Agent#({agent_id.id}:{agent_id.gid})]@{self.get_round_number()}", end=""
        )
        print(*args)  # noqa: T201
