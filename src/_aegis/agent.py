import importlib.util
import sys
from pathlib import Path
from types import ModuleType

from _aegis.command_manager import CommandManager
from _aegis.common.world.cell import Cell
from .common import AgentID, Direction, Location
from _aegis.common.commands.aegis_command import AegisCommand
from _aegis.common.commands.aegis_commands import (
    AEGIS_UNKNOWN,
    OBSERVE_RESULT,
    SEND_MESSAGE_RESULT,
    RECHARGE_RESULT,
    WORLD_UPDATE,
)
from _aegis.common.commands.agent_command import AgentCommand
from _aegis.common.commands.agent_commands import SEND_MESSAGE
from _aegis.common.world.info import SurroundInfo
from _aegis.common.world.world import World

try:
    from _aegis.common.commands.aegis_commands.SAVE_SURV_RESULT import SAVE_SURV_RESULT
except ImportError:
    SAVE_SURV_RESULT = None  # pyright: ignore[reportConstantRedefinition]


class Agent:
    def __init__(
        self,
        world: World,
        aegis_world: World,
        id: AgentID,
        location: Location,
        energy_level: int,
    ) -> None:
        self._round: int = 0
        self._world: World = world
        self._aegis_world: World = aegis_world
        self._id: AgentID = id
        self._location: Location = location
        self._energy_level: int = energy_level
        self._command_manager: CommandManager = CommandManager()
        self._module: ModuleType | None = None
        self._inbox: list[SEND_MESSAGE_RESULT] = []
        self._results: list[AegisCommand] = []
        self.steps_taken: int = 0

    def run(self) -> None:
        self._round += 1
        if self._module is None:
            raise RuntimeError("Module should not be of `None` type.")
        self._send_messages()
        self._send_results()
        self._module.think()  # pyright: ignore[reportAny]

    def _send_results(self) -> None:
        if self._results and self._module:
            for result in self._results:
                if isinstance(result, OBSERVE_RESULT) and hasattr(
                    self._module, "handle_observe"
                ):
                    self._module.handle_observe(self, result)  # pyright: ignore[reportAny]

                elif (
                    SAVE_SURV_RESULT is not None
                    and isinstance(result, SAVE_SURV_RESULT)
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
            raise FileNotFoundError("Agent not found")

        module_name = path.stem

        spec = importlib.util.spec_from_file_location(module_name, str(path))
        if spec is None or spec.loader is None:
            raise ImportError(f"Could not load spec from {path}")

        module = importlib.util.module_from_spec(spec)
        sys.modules[module_name] = module
        spec.loader.exec_module(module)

        # This must be injected after spec.loader, or else all these methods won't
        # exist in the agent
        module.__dict__.update(self.create_methods())

        if not hasattr(module, "think"):
            raise AttributeError(
                f"{path} does not define a `think(agent: Agent)` function."
            )

        self._module = module

    def update_surround(self, surround_info: SurroundInfo) -> None:
        for dir in Direction:
            cell_info = surround_info.get_surround_info(dir)
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

    def get_messages(self) -> list[SEND_MESSAGE]:
        return self._command_manager.get_messages()

    def handle_aegis_command(self, aegis_command: AegisCommand) -> None:
        if isinstance(aegis_command, SEND_MESSAGE_RESULT):
            self._inbox.append(aegis_command)
        elif isinstance(aegis_command, WORLD_UPDATE):
            move_result = aegis_command
            curr_info = move_result.surround_info.get_current_info()
            self.set_energy_level(move_result.energy_level)
            self.set_location(curr_info.location)
            self.update_surround(move_result.surround_info)
        elif SAVE_SURV_RESULT is not None and isinstance(
            aegis_command, SAVE_SURV_RESULT
        ):
            self._results.append(aegis_command)
        elif isinstance(aegis_command, RECHARGE_RESULT):
            recharge_result: RECHARGE_RESULT = aegis_command
            if recharge_result.was_successful:
                self.set_energy_level(recharge_result.charge_energy)
        elif isinstance(aegis_command, OBSERVE_RESULT):
            self._results.append(aegis_command)
        elif isinstance(aegis_command, AEGIS_UNKNOWN):
            self.log("Brain: Got Unknown command reply from AEGIS.")
        else:
            self.log(
                f"Brain: Got unrecognized reply from AEGIS: {aegis_command.__class__.__name__}.",
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

    def create_methods(self):
        return {
            "get_round_number": self.get_round_number,
            "get_agent_id": self.get_agent_id,
            "get_location": self.get_location,
            "get_energy_level": self.get_energy_level,
            "send": self.send,
            "on_map": self.on_map,
            "get_cell_at": self.get_cell_at,
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

    def log(self, message: str) -> None:
        agent_id = self.get_agent_id()
        id_str = f"[Agent#({agent_id.id}:{agent_id.gid})]@{self.get_round_number()}"
        print(f"{id_str}: {message}")
