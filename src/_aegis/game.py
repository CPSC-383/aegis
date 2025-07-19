import random
from typing import TYPE_CHECKING

from .aegis_world import AegisWorld
from .agent import Agent
from .agent_controller import AgentController
from .args_parser import Args
from .command_processor import CommandProcessor
from .common import Direction, Location
from .common.commands.aegis_commands import ObserveResult, SendMessageResult
from .common.commands.agent_commands import Move, Observe, Save, SendMessage
from .common.world.cell import Cell
from .common.world.objects.survivor import Survivor
from .id_gen import IDGenerator
from .logger import LOGGER
from .server_websocket import WebSocketServer
from .team import Team
from .team_info import TeamInfo
from .world import World

try:
    from .common.commands.aegis_commands.save_result import SaveResult
except ImportError:
    predictions_imported = False
else:
    predictions_imported = True

if TYPE_CHECKING:
    from .agent_predictions.prediction_handler import (
        PredictionHandler as PredictionHandlerType,
    )
    from .common.commands.agent_command import AgentCommand
else:
    PredictionHandlerType = object


class Game:
    def __init__(self, args: Args, world: World) -> None:
        random.seed(world.seed)
        self.args: Args = args
        self.running: bool = True
        self.world: World = world
        self.round: int = 0
        self.id_gen: IDGenerator = IDGenerator()
        self.team_info: TeamInfo = TeamInfo()
        self._agents: list[Agent] = []
        self._agent_commands: list[AgentCommand] = []
        self._aegis_world: AegisWorld = AegisWorld(self._agents, args)
        self.ws_server: WebSocketServer = WebSocketServer()
        if args.client:
            self.ws_server.set_wait_for_client()
        self._prediction_handler: PredictionHandlerType | None = None
        self._command_processor: CommandProcessor = CommandProcessor(
            self._agents,
            self._aegis_world,
            self._prediction_handler,
        )
        self.team_agents: dict[Team, str] = {}
        if self.args.agent1 is not None:
            self.team_agents[Team.GOOBS] = self.args.agent1
        if self.args.agent2 is not None:
            self.team_agents[Team.VOIDSEERS] = self.args.agent2
        self._init_spawn()

    def _init_spawn(self) -> None:
        spawns = self.get_spawns()
        loc = random.choice(spawns)
        if self.args.agent1 and (self.args.agent2 is None):
            self.spawn_agent(loc, Team.GOOBS)
        elif self.args.agent2 and (self.args.agent1 is None):
            self.spawn_agent(loc, Team.VOIDSEERS)
        else:
            for team in Team:
                self.spawn_agent(loc, team)

    def run_round(self) -> None:
        self.round += 1
        self._command_processor.run_turn()
        self._grim_reaper()

        if self._is_game_over():
            self.running = False
            return

    def _is_game_over(self) -> bool:
        if self.round == self.world.rounds:
            LOGGER.info("Max rounds reached.")
        if len(self._agents) == 0:
            LOGGER.info("All agents are dead.")
            return True

        survivors_saved = self._aegis_world.get_total_saved_survivors()
        total_survivors = self._aegis_world.get_num_survivors()
        if survivors_saved == total_survivors:
            LOGGER.info("All survivors saved")
            return True

        return False

    def _grim_reaper(self) -> None:
        dead_agents = self._aegis_world.grim_reaper()

        for agent_id in dead_agents:
            agent = self._aegis_world.get_agent(agent_id)
            if agent is None:
                continue
            self._agents.remove(agent)

    def spawn_agent(
        self, loc: Location, team: Team, agent_id: int | None = None
    ) -> None:
        if agent_id is None:
            agent_id = self.id_gen.next_id()
        agent = Agent(
            self, agent_id, loc, team, self.world.start_energy, debug=self.args.debug
        )
        ac = AgentController(self, agent)
        agent.load(self.team_agents[team], self.create_methods(ac))  # pyright: ignore[reportUnknownMemberType]
        self.add_agent(agent, loc)
        self.team_info.inc_units(agent.team, 1)

    def add_agent(self, agent: Agent, loc: Location) -> None:
        if agent not in self._agents:
            self._agents.append(agent)

            cell = self.get_cell_at(loc)
            if cell is None:
                return

            cell.agents.append(agent.id)
            LOGGER.info("Aegis  : Added agent %s", agent.id)

    def on_map(self, location: Location) -> bool:
        return (
            location.x >= 0
            and location.y >= 0
            and location.x < self.world.width
            and location.y < self.world.height
        )

    def get_cell_at(self, location: Location) -> Cell | None:
        if not self.on_map(location):
            return None
        return self.world.get_cell_at(location)

    def get_survs(self) -> list[Location]:
        return [
            cell.location for cell in self.world.cells if cell.number_of_survivors() > 0
        ]

    def get_spawns(self) -> list[Location]:
        return [cell.location for cell in self.world.cells if cell.is_spawn_cell()]

    def get_charging_cells(self) -> list[Location]:
        return [cell.location for cell in self.world.cells if cell.is_charging_cell()]

    def create_methods(self, ac: AgentController):  # noqa: ANN202
        methods = {
            "Direction": Direction,
            "Move": Move,
            "Observe": Observe,
            "Save": Save,
            "SendMessage": SendMessage,
            "Survivor": Survivor,
            "ObserveResult": ObserveResult,
            "SendMessageResult": SendMessageResult,
            "get_round_number": ac.get_round_number,
            "get_id": ac.get_id,
            "get_team": ac.get_team,
            "get_location": ac.get_location,
            "get_energy_level": ac.get_energy_level,
            "send": ac.send,
            "on_map": self.on_map,
            "get_cell_at": self.get_cell_at,
            "get_charging_cells": self.get_charging_cells,
            "get_spawns": self.get_spawns,
            "get_survs": self.get_survs,
            "log": ac.log,
        }

        if predictions_imported:
            methods["SaveResult"] = SaveResult  # pyright: ignore[reportPossiblyUnboundVariable, reportArgumentType]

        return methods
