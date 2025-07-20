import random
from typing import TYPE_CHECKING

from .agent import Agent
from .agent_controller import AgentController
from .args_parser import Args
from .command_processor import CommandProcessor
from .common import Cell, CellInfo, Direction, Location
from .common.commands.aegis_commands import ObserveResult, SendMessageResult
from .common.commands.agent_commands import Move, Observe, Save, SendMessage
from .common.objects import Rubble, Survivor
from .constants import Constants
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
        self._agents: dict[int, Agent] = {}
        self._agent_commands: list[AgentCommand] = []
        self.ws_server: WebSocketServer = WebSocketServer()
        if args.client:
            self.ws_server.set_wait_for_client()
        self._prediction_handler: PredictionHandlerType | None = None
        self._command_processor: CommandProcessor = CommandProcessor(
            self,
            self._agents,
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

        commands: list[AgentCommand] = []
        messages: list[SendMessage] = []

        for agent in list(self._agents.values()):
            agent.run()
            command = agent.command_manager.get_action_command()
            if command is not None:
                commands.append(command)

            directives = agent.command_manager.get_directives()
            commands.extend(directives)
            messages.extend(agent.command_manager.get_messages())

            agent.log(f"Action received: {command}")
            agent.log(f"Directives received: {directives}")

        self._command_processor.process(commands, messages)
        self.process_end_of_round()

    def _is_game_over(self) -> bool:
        if self.round == self.world.rounds:
            print()  # noqa: T201
            LOGGER.info("Max rounds reached.")
            return True

        if len(self._agents) == 0:
            print()  # noqa: T201
            LOGGER.info("All agents are dead.")
            return True

        saved_goobs = self.team_info.get_saved(Team.GOOBS)
        saved_seers = self.team_info.get_saved(Team.VOIDSEERS)
        if saved_goobs + saved_seers == self.world.total_survivors:
            print()  # noqa: T201
            LOGGER.info("All survivors saved")
            return True

        return False

    def grim_reaper(self) -> None:
        dead_agents: list[Agent] = []

        for agent in self._agents.values():
            died = False
            cell = self.get_cell_at(agent.location)
            if agent.energy_level <= 0:
                LOGGER.info("Agent %s ran out of energy and died.\n", agent.id)
                died = True
            elif cell and cell.is_killer_cell():
                LOGGER.info("Agent %s ran into killer cell and died.\n", agent.id)
                died = True

            if died:
                dead_agents.append(agent)

        for agent in dead_agents:
            self.remove_agent(agent.id)

    def process_end_of_round(self) -> None:
        self.grim_reaper()
        if self._is_game_over():
            self.running = False
            return

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
        self.team_info.add_units(agent.team, 1)

    def add_agent(self, agent: Agent, loc: Location) -> None:
        if agent not in self._agents:
            self._agents[agent.id] = agent

            cell = self.get_cell_at(loc)
            cell.agents.append(agent.id)
            LOGGER.info("Added agent %s", agent.id)

    def remove_agent(self, agent_id: int) -> None:
        agent = self._agents[agent_id]
        del self._agents[agent_id]
        cell = self.get_cell_at(agent.location)
        cell.agents.remove(agent_id)

    def get_agent(self, agent_id: int) -> Agent:
        return self._agents[agent_id]

    def remove_layer(self, loc: Location, team: Team) -> None:
        cell = self.get_cell_at(loc)
        world_object = cell.remove_top_layer()
        if world_object is None:
            return

        if isinstance(world_object, Survivor):
            survivor = world_object
            is_alive = survivor.get_health() > 0
            self.team_info.add_saved(team, 1, is_alive=is_alive)
            self.team_info.add_score(team, Constants.SURVIVOR_SAVE_SCORE)

    def move_agent(self, agent_id: int, loc: Location) -> None:
        agent = self.get_agent(agent_id)
        curr_cell = self.get_cell_at(agent.location)
        dest_cell = self.get_cell_at(loc)
        curr_cell.agents.remove(agent.id)
        dest_cell.agents.append(agent.id)
        agent.set_location(dest_cell.location)

    def on_map(self, location: Location) -> bool:
        return (
            location.x >= 0
            and location.y >= 0
            and location.x < self.world.width
            and location.y < self.world.height
        )

    def get_cell_at(self, location: Location) -> Cell:
        return self.world.get_cell_at(location)

    def get_cell_info_at(self, location: Location) -> CellInfo:
        cell = self.world.get_cell_at(location)
        return CellInfo(
            cell.type, cell.location, cell.move_cost, cell.agents, cell.get_top_layer()
        )

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
            "Location": Location,
            "Move": Move,
            "Observe": Observe,
            "Rubble": Rubble,
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
            "spawn_agent": ac.spawn_agent,
            "on_map": self.on_map,
            "get_cell_info_at": self.get_cell_info_at,
            "get_charging_cells": self.get_charging_cells,
            "get_spawns": self.get_spawns,
            "get_survs": self.get_survs,
            "log": ac.log,
        }

        if predictions_imported:
            methods["SaveResult"] = SaveResult  # pyright: ignore[reportPossiblyUnboundVariable, reportArgumentType]

        return methods
