# pyright: reportImportCycles = false
from typing import TYPE_CHECKING, Any

from _aegis.constants import Constants

from .common import CellContents, Location
from .common.commands.agent_command import AgentCommand
from .team import Team
from .types.prediction import SurvivorID

if TYPE_CHECKING:
    from .agent import Agent
    from .game import Game


class AgentController:
    def __init__(self, game: "Game", agent: "Agent") -> None:
        self._game: Game = game
        self._agent: Agent = agent

    def assert_not_none(self, value: object) -> None:
        if value is None:
            error = "Argument has invalid None value"
            raise AgentError(error)

    def assert_spawn(self, loc: Location, team: Team) -> None:
        if loc not in self._game.get_spawns():
            error = f"Invalid spawn: {loc}"
            raise AgentError(error)

        units = self._game.team_info.get_units(team)
        if units == self._game.args.amount:
            error = "Max agents reached."
            raise AgentError(error)

    def assert_loc(self, loc: Location) -> None:
        self.assert_not_none(loc)
        if not self._game.on_map(loc):
            error = "Location is not on the map"
            raise AgentError(error)

    # Public Agent Methods

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

    def drone_scan(self, loc: Location) -> None:
        self.assert_loc(loc)
        self._game.start_drone_scan(loc, self._agent.team)
        self._agent.add_energy(-Constants.DRONE_SCAN_ENERGY_COST)

    # def get_cell_at(self, loc: Location) -> Cell | None:
    #     self.assert_loc(loc)
    #     return self._game.get_cell_at(loc)

    def get_cell_contents_at(self, loc: Location) -> CellContents | None:
        self.assert_loc(loc)

        # Only give cell contents if the cell is within 1 tile of the agent, or being drone scanned
        dist_to_loc = self.get_location().distance_to_chebyshev(loc)
        is_drone_scanned = self._game.is_loc_drone_scanned(loc, self._agent.team)
        if dist_to_loc <= 1 or is_drone_scanned:
            return self._game.get_cell_contents_at(loc)

        return None

    def spawn_agent(self, loc: Location) -> None:
        self.assert_spawn(loc, self._agent.team)
        self._game.spawn_agent(loc, self._agent.team)

    def read_pending_predictions(
        self,
    ) -> list[tuple[SurvivorID, Any, Any]] | None:
        return self._game.get_prediction_info_for_agent(self._agent.team)

    def log(self, *args: object) -> None:
        self._agent.log(*args)


class AgentError(Exception):
    pass
