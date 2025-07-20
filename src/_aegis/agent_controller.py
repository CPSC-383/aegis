# pyright: reportImportCycles = false
from typing import TYPE_CHECKING

from .agent import Agent
from .common import Cell, Location
from .common.commands.agent_command import AgentCommand
from .team import Team

if TYPE_CHECKING:
    from .game import Game


class AgentController:
    def __init__(self, game: "Game", agent: Agent) -> None:
        self._game: Game = game
        self._agent: Agent = agent

    def get_round_number(self) -> int:
        return self._game.round

    def get_id(self) -> int:
        return self._agent.id

    def get_team(self) -> Team:
        return self._agent.team

    def get_location(self) -> Location:
        return self._agent.location

    def get_energy_level(self) -> int:
        return self._agent.energy_level

    def send(self, command: AgentCommand) -> None:
        command.set_id(self.get_id())
        self._agent.command_manager.send(command)

    def on_map(self, loc: Location) -> bool:
        return self._game.on_map(loc)

    def get_cell_at(self, loc: Location) -> Cell | None:
        return self._game.get_cell_at(loc)

    def log(self, *args: object) -> None:
        if not self._agent.debug:
            return

        agent_id = self.get_id()
        print(  # noqa: T201
            f"[Agent#({agent_id}:{self.get_team().name})@{self._game.round}] ", end=""
        )
        print(*args)  # noqa: T201
