# pyright: reportImportCycles = false

from typing import TYPE_CHECKING

from .common import Direction, Location
from .constants import Constants
from .message_buffer import MessageBuffer
from .sandbox.core import LumenCore
from .sandbox.sandbox import Sandbox
from .team import Team
from .types import MethodDict

if TYPE_CHECKING:
    from .game import Game


class Agent:
    def __init__(
        self,
        game: "Game",
        agent_id: int,
        location: Location,
        team: Team,
        energy_level: int,
    ) -> None:
        self.game: Game = game
        self.has_visited: list[bool] = [False] * (game.world.height * game.world.width)
        self.id: int = agent_id
        self.team: Team = team
        self.location: Location = location
        self.energy_level: int = energy_level
        self.core: LumenCore | None = None
        self.message_buffer: MessageBuffer = MessageBuffer()
        self.steps_taken: int = 0
        self.debug: bool = False
        self.errors: list[str] = []

    def process_beginning_of_turn(self) -> None:
        if self.core is None:
            error = "Trying to run an agent that hasn't launched"
            raise RuntimeError(error)

    def process_end_of_turn(self) -> None:
        self.message_buffer.next_round(self.game.round + 1)
        self.game.game_pb.end_turn(self)

    def turn(self) -> None:
        self.process_beginning_of_turn()
        self.errors.clear()
        self.core.run()  # pyright: ignore[reportOptionalMemberAccess]
        self.log_errors()
        self.process_end_of_turn()

    def kill(self) -> None:
        self.core.kill()  # pyright: ignore[reportOptionalMemberAccess]

    def launch(
        self, code: Sandbox | None, methods: MethodDict, *, debug: bool = False
    ) -> None:
        if code is None:
            error = "No code provided to launch."
            raise ValueError(error)

        self.core = LumenCore(code, methods, self.error)
        self.debug = debug

    def apply_movement_cost(self, direction: Direction) -> None:
        if direction == Direction.CENTER:
            return

        cell = self.game.get_cell_at(self.location.add(direction))
        self.add_energy(-cell.move_cost)
        self.steps_taken += 1

    def add_energy(self, energy: int) -> None:
        self.energy_level += energy
        self.energy_level = min(Constants.MAX_ENERGY_LEVEL, self.energy_level)

    def error(self, msg: str) -> None:
        self.errors.append(msg)

    def log_errors(self) -> None:
        for error in self.errors:
            self.log(error)

    def log(self, *args: object) -> None:
        if not self.debug:
            return

        agent_id = self.id
        print(f"[Agent#({agent_id}:{self.team.name})@{self.game.round}] ", end="")
        print(*args)
