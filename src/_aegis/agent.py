# pyright: reportImportCycles = false

import traceback
from pathlib import Path
from typing import TYPE_CHECKING

from .command_manager import CommandManager
from .common import CellInfo, Direction, Location
from .common.commands.aegis_command import AegisCommand
from .common.commands.aegis_commands import (
    ObserveResult,
    RechargeResult,
    SendMessageResult,
    WorldUpdate,
)
from .common.commands.aegis_commands.save_result import SaveResult
from .constants import Constants
from .logger import LOGGER
from .sandbox import Sandbox
from .team import Team
from .world_parser import load_agent_world

if TYPE_CHECKING:
    from .game import Game
    from .world import World


class Agent:
    def __init__(  # noqa: PLR0913
        self,
        game: "Game",
        agent_id: int,
        location: Location,
        team: Team,
        energy_level: int,
        *,
        debug: bool,
    ) -> None:
        self.game: Game = game
        self.world: World = load_agent_world(game.world)
        self.id: int = agent_id
        self.team: Team = team
        self.location: Location = location
        self.energy_level: int = energy_level
        self.command_manager: CommandManager = CommandManager()
        self.sandbox: Sandbox | None = None
        self.inbox: list[SendMessageResult] = []
        self.results: list[AegisCommand] = []
        self.steps_taken: int = 0
        self.debug: bool = debug

    def process_start_of_turn(self) -> None:
        self._send_messages()
        self._send_results()

    def run(self) -> None:
        if self.sandbox is None:
            error = "Sandbox should not be of `None` type."
            raise RuntimeError(error)

        self.process_start_of_turn()
        try:
            self.sandbox.think()
        except Exception:  # noqa: BLE001
            self.log(traceback.format_exc(limit=5))

    def _send_results(self) -> None:
        if self.results and self.sandbox:
            for result in self.results:
                if (
                    isinstance(result, ObserveResult)
                    and self.sandbox.has_handle_observe()
                ):
                    self.sandbox.handle_observe(result)  # pyright: ignore[reportUnknownMemberType]

                elif isinstance(result, SaveResult) and self.sandbox.has_handle_save():
                    self.sandbox.handle_save(result)  # pyright: ignore[reportUnknownMemberType]
        self.results.clear()

    def _send_messages(self) -> None:
        if self.inbox and self.sandbox and self.sandbox.has_handle_messages():
            self.sandbox.handle_messages(self.inbox)  # pyright: ignore[reportUnknownMemberType]
        self.inbox.clear()

    def load(self, agent_path: str, methods) -> None:  # pyright: ignore[reportUnknownParameterType, reportMissingParameterType] # noqa: ANN001
        path = Path(agent_path).resolve()
        if not path.exists():
            error = "Agent not found"
            raise FileNotFoundError(error)

        sandbox = Sandbox(methods)  # pyright: ignore[reportUnknownArgumentType]
        sandbox.load_and_compile(path)
        sandbox.init()

        if not sandbox.has_think():
            error = f"{path} does not define a `think()` function."
            raise AttributeError(error)

        self.sandbox = sandbox

    def update_surround(self, surround: dict[Direction, CellInfo]) -> None:
        for cell_info in surround.values():
            cell = self.world.get_cell_at(cell_info.location)
            cell.agents = cell_info.agents[:]
            cell.move_cost = cell_info.move_cost
            cell.set_top_layer(cell_info.top_layer)

    def set_location(self, location: Location) -> None:
        self.location = location

    def set_energy_level(self, energy_level: int) -> None:
        self.energy_level = energy_level

    def add_energy(self, energy: int) -> None:
        self.energy_level += energy
        self.energy_level = min(Constants.MAX_ENERGY_LEVEL, self.energy_level)

    def add_step_taken(self) -> None:
        self.steps_taken += 1

    def handle_aegis_command(self, aegis_command: AegisCommand) -> None:
        if isinstance(aegis_command, SendMessageResult):
            self.inbox.append(aegis_command)
        elif isinstance(aegis_command, WorldUpdate):
            world_update = aegis_command
            curr_info = world_update.surround[Direction.CENTER]
            self.set_energy_level(world_update.energy_level)
            self.set_location(curr_info.location)
            self.update_surround(world_update.surround)
        elif isinstance(aegis_command, SaveResult):
            self.results.append(aegis_command)
        elif isinstance(aegis_command, RechargeResult):
            recharge_result: RechargeResult = aegis_command
            if recharge_result.was_successful:
                self.set_energy_level(recharge_result.charge_energy)
        elif isinstance(aegis_command, ObserveResult):
            self.results.append(aegis_command)
        else:
            LOGGER.warning(
                "Got unrecognized reply from AEGIS: ",
                f"{aegis_command.__class__.__name__}.",
            )

    def log(self, *args: object) -> None:
        if not self.debug:
            return

        agent_id = self.id
        print(  # noqa: T201
            f"[Agent#({agent_id}:{self.team.name})@{self.game.round}] ", end=""
        )
        print(*args)  # noqa: T201
