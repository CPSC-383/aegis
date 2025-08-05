# pyright: reportImportCycles = false

from typing import TYPE_CHECKING

from .aegis_config import is_feature_enabled
from .agent import Agent
from .agent_predictions.prediction_handler import PredictionHandler
from .common import CellInfo, Direction
from .common.commands.aegis_command import AegisCommand
from .common.commands.aegis_commands import (
    ObserveResult,
    RechargeResult,
    SendMessageResult,
    WorldUpdate,
)
from .common.commands.agent_command import AgentCommand
from .common.commands.agent_commands import (
    Dig,
    Observe,
    Predict,
    Recharge,
    Save,
    SendMessage,
)
from .common.location import Location
from .common.objects.rubble import Rubble
from .common.objects.survivor import Survivor
from .constants import Constants
from .logger import LOGGER
from .types.prediction import SurvivorID

if TYPE_CHECKING:
    from .game import Game


class CommandProcessor:
    def __init__(
        self,
        game: "Game",
        agents: dict[int, Agent],
        prediction_handler: PredictionHandler | None,
    ) -> None:
        self._agents: dict[int, Agent] = agents
        self._game: Game = game
        self._prediction_handler: PredictionHandler | None = prediction_handler

    def process(
        self, commands: list[AgentCommand], messages: list[SendMessage]
    ) -> None:
        self._process(commands)
        self._route_messages(messages)
        self._results(commands)

    def _route_messages(self, messages: list[SendMessage]) -> None:
        for message in messages:
            sender_id = message.get_id()
            recipients = message.agents

            if len(recipients) == 0:
                target_agents = list(self._agents.values())
            else:
                target_agents: list[Agent] = []
                for agent in self._agents.values():
                    if agent.id in recipients:
                        target_agents.append(agent)

            target_agents = [agent for agent in target_agents if agent.id != sender_id]

            for recipient in target_agents:
                res = SendMessageResult(sender_id, recipients, message.message)
                recipient.handle_aegis_command(res)

    def _process(self, commands: list[AgentCommand]) -> None:
        for cmd in commands:
            agent_id = cmd.get_id()
            agent = self._game.get_agent(agent_id)

            match cmd:
                case Dig():
                    self._handle_dig(cmd)
                case Save():
                    self._handle_save(cmd)
                case Recharge():
                    self._handle_recharge(cmd)
                case Observe():
                    agent = self._game.get_agent(cmd.get_id())
                    agent.add_energy(-Constants.OBSERVE_ENERGY_COST)
                case Predict():
                    if is_feature_enabled("ENABLE_PREDICTIONS"):
                        self._handle_predict(cmd)
                    else:
                        LOGGER.warning(
                            "Predict command received but predictions are disabled!!"
                        )
                case _:
                    LOGGER.warning("Aegis received an unknown command: %s", cmd)

    def _handle_predict(self, cmd: Predict) -> None:
        agent = self._game.get_agent(cmd.get_id())
        if self._prediction_handler is not None:
            prediction_result = self._prediction_handler.predict(
                agent.team, SurvivorID(cmd.surv_id), cmd.label
            )

            if prediction_result is None:
                # No valid pending prediction exists (already predicted or never created)
                LOGGER.warning(
                    f"Agent {agent.id} attempted invalid prediction for surv_id {cmd.surv_id}"
                )
            elif prediction_result:
                self._game.team_info.add_score(agent.team, Constants.PRED_CORRECT_SCORE)
                self._game.team_info.add_predicted(agent.team, 1, correct=True)
            else:
                self._game.team_info.add_predicted(agent.team, 1, correct=False)

    def _handle_recharge(self, cmd: Recharge) -> None:
        agent = self._game.get_agent(cmd.get_id())
        cell = self._game.get_cell_at(agent.location)
        if cell and cell.is_charging_cell():
            if (
                agent.energy_level + Constants.NORMAL_CHARGE
                > Constants.MAX_ENERGY_LEVEL
            ):
                pass
                # agent.set_energy_level(Constants.MAX_ENERGY_LEVEL)
            else:
                agent.add_energy(Constants.NORMAL_CHARGE)

    def _handle_dig(self, cmd: Dig) -> None:
        agent = self._game.get_agent(cmd.get_id())
        cell = self._game.get_cell_at(agent.location)
        agents_here = [aid for aid in cell.agents if self._game.get_agent(aid)]
        top_layer = cell.get_top_layer()

        if isinstance(top_layer, Rubble):
            if top_layer.agents_required <= len(agents_here) and all(
                (a := self._game.get_agent(aid))
                and a.energy_level >= top_layer.energy_required
                for aid in agents_here
            ):
                agent.add_energy(-top_layer.energy_required)
                self._game.remove_layer(cell.location)
        else:
            agent.add_energy(-Constants.DIG_ENERGY_COST)

    def _handle_save(self, cmd: Save) -> None:
        agent = self._game.get_agent(cmd.get_id())
        cell = self._game.get_cell_at(agent.location)

        top_layer = cell.get_top_layer()
        agent.add_energy(-Constants.SAVE_ENERGY_COST)
        if top_layer is None:
            return

        if isinstance(top_layer, Survivor):
            survivor = top_layer
            team = agent.team
            is_alive = survivor.get_health() > 0
            self._game.team_info.add_saved(team, 1, is_alive=is_alive)
            self._game.team_info.add_score(team, Constants.SURVIVOR_SAVE_ALIVE_SCORE)

            # Create a pending prediction for this survivor
            if self._prediction_handler is not None:
                self._prediction_handler.create_pending_prediction(
                    team,
                    SurvivorID(survivor.id),
                )

            self._game.remove_layer(cell.location)

    def _results(self, commands: list[AgentCommand]) -> None:
        for cmd in commands:
            agent = self._game.get_agent(cmd.get_id())
            energy = agent.energy_level
            location = agent.location

            surround: dict[Direction, CellInfo] = {}
            for direction in Direction:
                loc = location.add(direction)
                if not self._game.on_map(loc):
                    continue
                cell = self._game.get_cell_at(loc)
                surround[direction] = cell.get_cell_info() if cell else CellInfo()

            result_commands = self._handle_command(
                cmd,
                agent,
                energy,
                location,
                surround,
            )

            for result in result_commands:
                agent.handle_aegis_command(result)

    def _handle_command(
        self,
        cmd: AgentCommand,
        agent: Agent,
        energy: int,
        location: Location,
        surround: dict[Direction, CellInfo],
    ) -> list[AegisCommand]:
        match cmd:
            case Dig() | Save():
                results: list[AegisCommand] = [WorldUpdate(energy, surround)]
                if isinstance(cmd, Save):
                    results.extend(self._handle_save_cmd(agent))
                return results

            case Recharge():
                agent_cell = self._game.get_cell_at(location)
                success = agent_cell.is_charging_cell()
                return [RechargeResult(energy, was_successful=success)]

            case Observe():
                cell_info, layers = CellInfo(), []
                cell = self._game.get_cell_at(cmd.location)
                if cell:
                    cell_info = cell.get_cell_info()
                    layers = cell.get_layers()
                return [ObserveResult(energy, cell_info, layers)]

            case _:
                return []

    def _handle_save_cmd(self, _: Agent) -> list[AegisCommand]:
        # Not returning pred info in surv result anymore, so don't need this i think
        return []

    # def _handle_top_layer(
    #     self,
    #     top_layer: WorldObject,
    #     cell: Cell,
    #     agents_here: list[AgentID],
    #     gid_counter: list[int],
    # ) -> None:
    #     if isinstance(top_layer, Survivor):
    #         # self._game.remove_layer(cell.location)
    #         # alive_count, dead_count = self._calculate_survivor_stats(top_layer)
    #         # self._assign_points(agents_here, alive_count, dead_count, gid_counter)
    #
    #         if (
    #             is_feature_enabled("ENABLE_PREDICTIONS")
    #             and self._prediction_handler is not None
    #         ):
    #             self._prediction_handler.add_agent_to_no_pred_yet(
    #                 agents_here[0],
    #                 top_layer.id,
    #             )
    #
    #     else:
    #         for aid in agents_here:
    #             agent = self._world.get_agent(aid)
    #             if agent is not None:
    #                 agent.remove_energy(Constants.SAVE_ENERGY_COST)
    #
    # def _calculate_survivor_stats(self, survivor: Survivor) -> tuple[int, int]:
    #     self._world.remove_survivor(survivor)
    #     return (1, 0) if survivor.is_alive() else (0, 1)
    #
    # def _handle_random_tie(
    #     self,
    #     alive_count: int,
    #     dead_count: int,
    #     gid_counter: list[int],
    #     max_group_size: int,
    # ) -> None:
    #     while True:
    #         # random_id = Utility.next_int() % len(gid_counter)
    #         random_id = 0
    #         if gid_counter[random_id] == max_group_size:
    #             if alive_count > 0:
    #                 state = Constants.SAVE_STATE_ALIVE
    #                 amount = alive_count
    #             else:
    #                 state = Constants.SAVE_STATE_DEAD
    #                 amount = dead_count
    #             # self._agent_handler.increase_agent_group_saved(
    # random_id, amount, state)
    #             break
    #
    # def _handle_all_tie(
    #     self,
    #     alive_count: int,
    #     dead_count: int,
    #     gid_counter: list[int],
    #     max_group_size: int,
    # ) -> None:
    #     for gid, count in enumerate(gid_counter):
    #         if count == max_group_size:
    #             if alive_count > 0:
    #                 state = Constants.SAVE_STATE_ALIVE
    #                 amount = alive_count
    #             else:
    #                 state = Constants.SAVE_STATE_DEAD
    #                 amount = dead_count
    #
    #             # self._agent_handler.increase_agent_group_saved(gid, amount, state)
