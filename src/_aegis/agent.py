# pyright: reportImportCycles = false

import traceback
from pathlib import Path
from typing import TYPE_CHECKING

from .common import Direction, Location
from .common.commands.aegis_command import AegisCommand
from .common.commands.aegis_commands import (
    ObserveResult,
)
from .constants import Constants
from .logger import LOGGER
from .message_buffer import MessageBuffer
from .sandbox import Sandbox
from .team import Team

if TYPE_CHECKING:
    from .game import Game


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
        self.has_visited: list[bool] = [False] * (game.world.height * game.world.width)
        self.id: int = agent_id
        self.team: Team = team
        self.location: Location = location
        self.energy_level: int = energy_level
        self.sandbox: Sandbox | None = None
        self.message_buffer: MessageBuffer = MessageBuffer()
        self.results: list[AegisCommand] = []
        self.steps_taken: int = 0
        self.debug: bool = debug

    def run(self) -> None:
        if self.sandbox is None:
            error = "Sandbox should not be of `None` type."
            raise RuntimeError(error)

        try:
            self.sandbox.think()
        except Exception:  # noqa: BLE001
            self.log(traceback.format_exc(limit=5))

        self.message_buffer.next_round(self.game.round + 1)
        self.game.game_pb.end_turn(self)

    def load(self, agent: str, methods) -> None:  # pyright: ignore[reportUnknownParameterType, reportMissingParameterType] # noqa: ANN001
        path = Path(f"agents/{agent}/main.py").resolve()
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

    def apply_movement_cost(self, direction: Direction) -> None:
        if direction == Direction.CENTER:
            return

        cell = self.game.get_cell_at(self.location.add(direction))
        self.add_energy(-cell.move_cost)
        self.steps_taken += 1

    def add_energy(self, energy: int) -> None:
        self.energy_level += energy
        self.energy_level = min(Constants.MAX_ENERGY_LEVEL, self.energy_level)

    def handle_aegis_command(self, aegis_command: AegisCommand) -> None:
        if isinstance(aegis_command, ObserveResult):
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
        print(f"[Agent#({agent_id}:{self.team.name})@{self.game.round}] ", end="")
        print(*args)
