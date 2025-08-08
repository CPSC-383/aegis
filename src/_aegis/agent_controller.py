# pyright: reportImportCycles = false
from typing import TYPE_CHECKING

import numpy as np
from numpy.typing import NDArray

from .aegis_config import has_feature
from .common import CellInfo, Direction, Location
from .common.objects.rubble import Rubble
from .common.objects.survivor import Survivor
from .constants import Constants
from .message import Message
from .team import Team

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

    def assert_move(self, direction: Direction) -> None:
        self.assert_not_none(direction)
        new_loc = self._agent.location.add(direction)

        if not self._game.on_map(new_loc):
            error = "Agent moved off the map"
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

    def move(self, direction: Direction) -> None:
        self.assert_move(direction)
        self._agent.apply_movement_cost(direction)
        new_loc = self._agent.location.add(direction)
        self._game.move_agent(self._agent.id, self._agent.location, new_loc)
        self._agent.location = new_loc

    def save(self) -> None:
        """Determine if there is a valid surv to save at this location, if so, (try to) save it."""
        # TODO @dante: add assert for unit type once thats added
        cell = self._game.get_cell_at(self._agent.location)
        top_layer = cell.get_top_layer()
        if top_layer is None or not isinstance(top_layer, Survivor):
            return

        self._game.save(top_layer, self._agent)

    def recharge(self) -> None:
        # TODO @dante: assert recharge
        cell = self._game.get_cell_at(self._agent.location)
        if not cell.is_charging_cell():
            return

        energy = min(
            Constants.NORMAL_CHARGE,
            Constants.MAX_ENERGY_LEVEL - self._agent.energy_level,
        )

        self._agent.add_energy(energy)

    def dig(self) -> None:
        """Determine if there is a valid rubble to dig at this location, if so, (try to) dig it."""
        # TODO @dante: add assert for unit type once thats added
        cell = self._game.get_cell_at(self._agent.location)
        top_layer = cell.get_top_layer()
        if top_layer is None or not isinstance(top_layer, Rubble):
            return

        self._game.dig(self._agent)

    def predict(self, surv_id: int, label: np.int32) -> None:
        # TODO @dante: assert predict
        if not has_feature("ALLOW_AGENT_PREDICTIONS"):
            msg = "Predictions are not enabled, therefore this method is not available."
            raise AgentError(msg)

        self._game.predict(surv_id, label, self._agent)

    def send_message(self, message: str, dest_ids: list[int]) -> None:
        # TODO @dante: add assert for message

        if not dest_ids:
            dest_ids = [
                agent.id
                for agent in self._game.agents.values()
                if agent.team == self._agent.team and agent.id != self._agent.id
            ]
        else:
            dest_ids = [aid for aid in dest_ids if aid != self._agent.id]

        msg = Message(
            message=message,
            round_num=self._game.round,
            sender_id=self._agent.id,
        )

        for agent_id in dest_ids:
            self._game.get_agent(agent_id).message_buffer.add_message(msg)

    def read_messages(self, round_num: int = -1) -> list[Message]:
        if round_num == -1:
            return self._agent.message_buffer.get_all_messages()
        return self._agent.message_buffer.get_messages(round_num)

    def drone_scan(self, loc: Location) -> None:
        self.assert_loc(loc)
        self._game.start_drone_scan(loc, self._agent.team)
        self._agent.add_energy(-Constants.DRONE_SCAN_ENERGY_COST)

    def get_cell_info_at(self, loc: Location) -> CellInfo:
        self.assert_loc(loc)

        idx = loc.x + loc.y * self._game.world.width
        cell_info = self._game.get_cell_info_at(loc)

        is_adjacent = self._agent.location.is_adjacent_to(loc)
        is_scanned = self._game.is_loc_drone_scanned(loc, self._agent.team)

        if not is_adjacent or not is_scanned:
            cell_info.agents = []
            top = cell_info.top_layer
            cell_info.layers = [top] if top is not None else []

        if has_feature("HIDDEN_MOVE_COSTS") and not self._agent.has_visited[idx]:
            cell_info.move_cost = 1

        return cell_info

    def spawn_agent(self, loc: Location) -> None:
        self.assert_spawn(loc, self._agent.team)
        self._game.spawn_agent(loc, self._agent.team)

    def read_pending_predictions(
        self,
    ) -> list[tuple[int, NDArray[np.uint8], NDArray[np.int32]]]:
        if not has_feature("ALLOW_AGENT_PREDICTIONS"):
            msg = "Predictions are not enabled, therefore this method is not available."
            raise AgentError(msg)

        return self._game.get_prediction_info_for_agent(self._agent.team)

    def log(self, *args: object) -> None:
        self._agent.log(*args)


class AgentError(Exception):
    pass
