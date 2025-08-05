import random
from pathlib import Path
from typing import TYPE_CHECKING, Any

from .agent import Agent
from .agent_controller import AgentController
from .agent_predictions.prediction_handler import PredictionHandler
from .args_parser import Args
from .command_processor import CommandProcessor
from .common import Cell, CellInfo, Direction, Location
from .common.commands.aegis_commands import ObserveResult, SendMessageResult
from .common.commands.aegis_commands.save_result import SaveResult
from .common.commands.agent_commands import (
    Dig,
    Move,
    Observe,
    Predict,
    Save,
    SendMessage,
)
from .common.objects import Rubble, Survivor
from .constants import Constants
from .game_pb import GamePb
from .id_gen import IDGenerator
from .logger import LOGGER
from .team import Team
from .team_info import TeamInfo
from .types.prediction import SurvivorID
from .world import World

if TYPE_CHECKING:
    from .common.commands.agent_command import AgentCommand


class Game:
    def __init__(self, args: Args, world: World, game_pb: GamePb) -> None:
        random.seed(world.seed)
        self.args: Args = args
        self.running: bool = True
        self.world: World = world
        self.round: int = 0
        self.id_gen: IDGenerator = IDGenerator()
        self.team_info: TeamInfo = TeamInfo()
        self.game_pb: GamePb = game_pb
        self._agents: dict[int, Agent] = {}

        self._prediction_handler: PredictionHandler | None = PredictionHandler(
            testing_for_marking=args.testing_for_marking
        )

        self._command_processor: CommandProcessor = CommandProcessor(
            self,
            self._agents,
            self._prediction_handler,
        )
        self.team_agents: dict[Team, str] = {}
        if self.args.agent is not None:
            self.team_agents[Team.GOOBS] = self.args.agent
        if self.args.agent2 is not None:
            self.team_agents[Team.VOIDSEERS] = self.args.agent2
        self._init_spawn()

    def _init_spawn(self) -> None:
        spawns = self.get_spawns()
        loc = random.choice(spawns)
        if self.args.agent and self.args.agent2 is None:
            self.spawn_agent(loc, Team.GOOBS)
        elif self.args.agent2 and self.args.agent is None:
            self.spawn_agent(loc, Team.VOIDSEERS)
        else:
            for team in Team:
                self.spawn_agent(loc, team)

    def run_round(self) -> None:
        self.round += 1
        self.game_pb.start_round(self.round)
        self.process_agent_commands()
        self.serialize_team_info()
        self.grim_reaper()
        self.game_pb.end_round()
        self.process_end_of_round()

    def process_agent_commands(self) -> None:
        commands: list[AgentCommand] = []
        messages: list[SendMessage] = []
        agents: list[Agent] = []

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
            agents.append(agent)  # defer end_turn
            agent.command_manager.clear()

        self._command_processor.process(commands, messages)

        for agent in agents:
            self.game_pb.end_turn(agent)

    def _is_game_over(self) -> bool:
        if self.round == self.world.rounds:
            print()  # noqa: T201
            LOGGER.info(f"Max rounds reached ({self.world.rounds}).")
            return True

        if len(self._agents) == 0:
            print()  # noqa: T201
            LOGGER.info("All agents are dead.")
            return True

        saved_goobs = self.team_info.get_saved(Team.GOOBS)
        saved_seers = self.team_info.get_saved(Team.VOIDSEERS)
        if saved_goobs + saved_seers == self.world.total_survivors:
            print()  # noqa: T201
            LOGGER.info("All survivors saved.")
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
        # Use the agent name directly
        agent_name = self.team_agents[team]
        agent.load(agent_name, self.create_methods(ac))  # pyright: ignore[reportUnknownMemberType]
        self.add_agent(agent, loc)
        self.team_info.add_units(agent.team, 1)
        self.game_pb.add_spawn(agent.id, agent.team, agent.location)

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
        self.game_pb.add_dead(agent_id)

    def get_agent(self, agent_id: int) -> Agent:
        return self._agents[agent_id]

    def remove_layer(self, loc: Location) -> None:
        cell = self.get_cell_at(loc)
        _ = cell.remove_top_layer()
        self.game_pb.add_removed_layer(loc)

    def move_agent(self, agent_id: int, loc: Location) -> None:
        agent = self.get_agent(agent_id)
        curr_cell = self.get_cell_at(agent.location)
        dest_cell = self.get_cell_at(loc)
        curr_cell.agents.remove(agent.id)
        dest_cell.agents.append(agent.id)
        agent.set_location(dest_cell.location)

    def on_map(self, location: Location) -> bool:
        return self.world.on_map(location)

    def get_cell_at(self, location: Location) -> Cell:
        return self.world.get_cell_at(location)

    def serialize_team_info(self) -> None:
        self.game_pb.add_team_info(Team.GOOBS, self.team_info)
        self.game_pb.add_team_info(Team.VOIDSEERS, self.team_info)

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
        return self.world.get_spawns()

    def get_charging_cells(self) -> list[Location]:
        return self.world.get_charging_cells()

    def get_prediction_info_for_agent(
        self, team: Team
    ) -> list[tuple[SurvivorID, Any, Any]] | None:
        """
        Get prediction information for a survivour saved by an agent's team.

        Args:
            team: The agent's team

        Returns:
            List of pending predictions for the team (Empty if no pending predictions) structured as (survivor_id, image, unique_labels)

        """
        if self._prediction_handler is not None:
            pending_predictions = self._prediction_handler.read_pending_predictions(
                team
            )
            if pending_predictions:
                return pending_predictions
        return None

    def create_methods(self, ac: AgentController) -> dict[str, Any]:
        return {
            "Dig": Dig,
            "Direction": Direction,
            "Location": Location,
            "Move": Move,
            "Observe": Observe,
            "Predict": Predict,
            "Rubble": Rubble,
            "Save": Save,
            "SaveResult": SaveResult,
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
            "read_pending_predictions": ac.read_pending_predictions,
            "log": ac.log,
        }
