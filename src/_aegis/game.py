import random
from typing import Any

from .aegis_config import is_feature_enabled
from .agent import Agent
from .agent_controller import AgentController
from .agent_predictions.prediction_handler import PredictionHandler
from .args_parser import Args
from .common import Cell, CellContents, CellInfo, Direction, Location
from .common.objects import Rubble, Survivor
from .constants import Constants
from .game_pb import GamePb
from .id_gen import IDGenerator
from .logger import LOGGER
from .team import Team
from .team_info import TeamInfo
from .types.prediction import PredictionLabel, SurvivorID
from .world import World


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
        self._drone_scans: dict[Location, dict[Team, int]] = {}
        self._pending_drone_scans: dict[Location, dict[Team, int]] = {}
        self._prediction_handler: PredictionHandler = PredictionHandler(args)
        self.agents: dict[int, Agent] = {}
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
        self.tick_drone_scans()
        self.round += 1
        self.game_pb.start_round(self.round)
        for agent in self.agents.values():
            agent.run()
        self.activate_pending_drone_scans()
        self.game_pb.send_drone_scan_update(self._drone_scans)
        self.serialize_team_info()
        self.grim_reaper()
        self.serialize_drone_scans()
        self.game_pb.end_round()
        self.process_end_of_round()

    def _is_game_over(self) -> bool:
        if self.round == self.world.rounds:
            print()
            LOGGER.info(f"Max rounds reached ({self.world.rounds}).")
            return True

        if len(self.agents) == 0:
            print()
            LOGGER.info("All agents are dead.")
            return True

        saved_goobs = self.team_info.get_saved(Team.GOOBS)
        saved_seers = self.team_info.get_saved(Team.VOIDSEERS)
        if saved_goobs + saved_seers == self.world.total_survivors:
            print()
            LOGGER.info("All survivors saved.")
            return True

        return False

    def grim_reaper(self) -> None:
        dead_agents: list[Agent] = []

        for agent in self.agents.values():
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
        if agent not in self.agents:
            self.agents[agent.id] = agent

            cell = self.get_cell_at(loc)
            cell.agents.append(agent.id)
            LOGGER.info("Added agent %s", agent.id)

    def remove_agent(self, agent_id: int) -> None:
        agent = self.agents[agent_id]
        del self.agents[agent_id]
        cell = self.get_cell_at(agent.location)
        cell.agents.remove(agent_id)
        self.game_pb.add_dead(agent_id)

    def get_agent(self, agent_id: int) -> Agent:
        return self.agents[agent_id]

    def remove_layer(self, loc: Location) -> None:
        cell = self.get_cell_at(loc)
        _ = cell.remove_top_layer()
        self.game_pb.add_removed_layer(loc)

    def mark_surrounding_cells_visited(self, agent: Agent, loc: Location) -> None:
        for direction in Direction:
            if direction == Direction.CENTER:
                continue

            new_loc = loc.add(direction)
            if not self.on_map(new_loc):
                continue

            index = new_loc.x + new_loc.y * self.world.width
            agent.has_visited[index] = True

    def add_agent_to_loc(self, agent_id: int, loc: Location) -> None:
        self.get_cell_at(loc).agents.append(agent_id)
        agent = self.get_agent(agent_id)
        if not is_feature_enabled("ENABLE_MOVE_COST"):
            self.mark_surrounding_cells_visited(agent, loc)

    def remove_agent_from_loc(self, agent_id: int, loc: Location) -> None:
        self.get_cell_at(loc).agents.remove(agent_id)

    def move_agent(self, agent_id: int, start_loc: Location, end_loc: Location) -> None:
        self.remove_agent_from_loc(agent_id, start_loc)
        self.add_agent_to_loc(agent_id, end_loc)

    def start_drone_scan(self, loc: Location, team: Team) -> None:
        if loc not in self._pending_drone_scans:
            self._pending_drone_scans[loc] = {}
        self._pending_drone_scans[loc][team] = Constants.DRONE_SCAN_DURATION

    def activate_pending_drone_scans(self) -> None:
        """Activate pending drone scans by moving them to active drone scans."""
        for loc, teams in self._pending_drone_scans.items():
            if loc not in self._drone_scans:
                self._drone_scans[loc] = {}
            for team, duration in teams.items():
                self._drone_scans[loc][team] = duration
                LOGGER.info(
                    f"Started drone scan at {loc} for {team} has {duration} duration on round {self.round}"
                )
        self._pending_drone_scans.clear()

    def is_loc_drone_scanned(self, loc: Location, team: Team) -> bool:
        return loc in self._drone_scans and team in self._drone_scans[loc]

    def get_drone_scan_duration(self, loc: Location, team: Team) -> int:
        return self._drone_scans[loc][team]

    def tick_drone_scans(self) -> None:
        for loc, teams in self._drone_scans.items():
            for team, duration in list(teams.items()):
                teams[team] = duration - 1
                LOGGER.info(
                    f"Drone scan at {loc} for {team} has {teams[team]} duration on round {self.round}"
                )
                if teams[team] <= 0:
                    del self._drone_scans[loc][team]

    def serialize_drone_scans(self) -> None:
        """Add all active drone scans to the protobuf data for this round."""
        for loc, teams in self._drone_scans.items():
            for team, duration in teams.items():
                self.game_pb.add_drone_scan(loc, team, duration)

    def save(self, survivor: Survivor, agent: Agent) -> None:
        is_alive = survivor.get_health() > 0
        points = (
            Constants.SURVIVOR_SAVE_ALIVE_SCORE
            if is_alive
            else Constants.SURVIVOR_SAVE_DEAD_SCORE
        )
        self.team_info.add_saved(agent.team, 1, is_alive=is_alive)
        self.team_info.add_score(agent.team, points)

        if is_feature_enabled("ENABLE_PREDICTIONS"):
            self._prediction_handler.create_pending_prediction(
                agent.team,
                SurvivorID(survivor.id),
            )

        self.remove_layer(agent.location)

    def dig(self, rubble: Rubble, agent: Agent) -> None:
        cell = self.get_cell_at(agent.location)
        agents = [self.get_agent(aid) for aid in cell.agents]
        enough_agents = len(agents) >= rubble.agents_required
        all_enough_energy = all(
            agent.energy_level >= rubble.energy_required for agent in agents
        )

        if not (enough_agents and all_enough_energy):
            return

        # Add back the dig energy if it was a valid dig
        energy = -rubble.energy_required + Constants.DIG_ENERGY_COST
        agent.add_energy(energy)
        self.remove_layer(cell.location)

    def predict(self, surv_id: int, label: int, agent: Agent) -> None:
        if is_feature_enabled("ENABLE_PREDICTIONS"):
            return

        is_correct = self._prediction_handler.predict(
            agent.team, SurvivorID(surv_id), PredictionLabel(label)
        )

        if is_correct is None:
            LOGGER.warning(
                f"Agent {agent.id} attempted invalid prediction for surv_id {surv_id}"
            )
            return
        score = Constants.PRED_CORRECT_SCORE if is_correct else 0
        self.team_info.add_score(agent.team, score)
        self.team_info.add_predicted(agent.team, 1, correct=is_correct)

    def on_map(self, loc: Location) -> bool:
        return 0 <= loc.x < self.world.width and 0 <= loc.y < self.world.height

    def get_cell_at(self, loc: Location) -> Cell:
        index = loc.x + loc.y * self.world.width
        return self.world.cells[index]

    def get_cell_info_at(self, location: Location) -> CellInfo:
        cell = self.get_cell_at(location)
        return CellInfo(
            cell.type, cell.location, cell.move_cost, cell.agents, cell.get_top_layer()
        )

    def serialize_team_info(self) -> None:
        self.game_pb.add_team_info(Team.GOOBS, self.team_info)
        self.game_pb.add_team_info(Team.VOIDSEERS, self.team_info)

    def get_cell_contents_at(self, location: Location) -> CellContents:
        cell = self.get_cell_at(location)
        return CellContents(cell.layers, cell.agents)

    def get_survs(self) -> list[Location]:
        return [
            cell.location for cell in self.world.cells if cell.number_of_survivors() > 0
        ]

    def get_spawns(self) -> list[Location]:
        return [cell.location for cell in self.world.cells if cell.is_spawn()]

    def get_charging_cells(self) -> list[Location]:
        return [cell.location for cell in self.world.cells if cell.is_charging_cell()]

    def get_prediction_info_for_agent(
        self, team: Team
    ) -> list[tuple[SurvivorID, Any, Any]]:
        """
        Get prediction information for a survivour saved by an agent's team.

        Args:
            team: The agent's team

        Returns:
            List of pending predictions for the team (Empty if no pending predictions) structured as (survivor_id, image, unique_labels)

        """
        return self._prediction_handler.read_pending_predictions(team)

    def create_methods(self, ac: AgentController) -> dict[str, Any]:
        return {
            "Direction": Direction,
            "Location": Location,
            "Rubble": Rubble,
            "Survivor": Survivor,
            "drone_scan": ac.drone_scan,
            "get_round_number": ac.get_round_number,
            "get_id": ac.get_id,
            "get_team": ac.get_team,
            "get_location": ac.get_location,
            "get_cell_info_at": ac.get_cell_info_at,
            "get_energy_level": ac.get_energy_level,
            "send_message": ac.send_message,
            "read_messages": ac.read_messages,
            "move": ac.move,
            "save": ac.save,
            "recharge": ac.recharge,
            "predict": ac.predict,
            "spawn_agent": ac.spawn_agent,
            "get_cell_contents_at": ac.get_cell_contents_at,
            "on_map": self.on_map,
            "get_charging_cells": self.get_charging_cells,
            "get_spawns": self.get_spawns,
            "get_survs": self.get_survs,
            "read_pending_predictions": ac.read_pending_predictions,
            "log": ac.log,
        }
