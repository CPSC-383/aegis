import logging
from typing import TYPE_CHECKING

from _aegis.common.location import Location
from _aegis.common.world.info.surround_info import SurroundInfo

from .aegis_config import is_feature_enabled
from .aegis_world import AegisWorld
from .agent import Agent
from .common.agent_id import AgentID
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
    Move,
    Observe,
    Recharge,
    Save,
    SendMessage,
)
from .common.constants import Constants
from .common.direction import Direction
from .common.utility import Utility
from .common.world.cell import Cell
from .common.world.info.cell_info import CellInfo
from .common.world.objects.rubble import Rubble
from .common.world.objects.survivor import Survivor
from .common.world.objects.world_object import WorldObject

try:
    from .common.commands.aegis_commands.save_result import SaveResult
    from .common.commands.agent_commands.predict import Predict
except ImportError:
    SaveResult = None
    Predict = None

if TYPE_CHECKING:
    from .agent_predictions.prediction_handler import (
        PredictionHandler as PredictionHandlerType,
    )
else:
    PredictionHandlerType = object

LOGGER = logging.getLogger("aegis")


class CommandProcessor:
    def __init__(
        self,
        agents: list[Agent],
        aegis_world: AegisWorld,
        prediction_handler: PredictionHandlerType | None,
    ) -> None:
        self._agents: list[Agent] = agents
        self._world: AegisWorld = aegis_world
        self._prediction_handler: PredictionHandlerType | None = prediction_handler

    def run_turn(self) -> None:
        commands: list[AgentCommand] = []
        messages: list[SendMessage] = []

        for agent in self._agents:
            agent.run()
            command = agent.get_action_command()
            if command is not None:
                commands.append(command)

            directives = agent.get_directives()
            commands.extend(directives)
            messages.extend(agent.get_messages())

            agent.log(f"Action Command Sent: {command}")
            agent.log(f"Directives Sent: {directives}")

        self._process(commands)
        self._route_messages(messages)
        self._results(commands)

    def _route_messages(self, messages: list[SendMessage]) -> None:
        for message in messages:
            sender_id = message.get_agent_id()
            sender = self._world.get_agent(sender_id)

            if sender is None:
                continue

            recipients = message.agent_id_list

            if len(recipients) == 0:
                target_agents = self._agents
            else:
                target_agents: list[Agent] = []
                for agent in self._agents:
                    if agent.get_agent_id() in recipients:
                        target_agents.append(agent)

            target_agents = [
                agent for agent in target_agents if agent.get_agent_id() != sender_id
            ]

            for recipient in target_agents:
                res = SendMessageResult(sender_id, recipients, message.message)
                recipient.handle_aegis_command(res)

    def _process(self, commands: list[AgentCommand]) -> None:
        for cmd in commands:
            agent_id = cmd.get_agent_id()
            agent = self._world.get_agent(agent_id)
            if agent is None:
                continue

            if (
                Predict is not None
                and isinstance(cmd, Predict)
                and is_feature_enabled("ENABLE_PREDICTIONS")
            ):
                pass
            else:
                match cmd:
                    case Dig():
                        self._handle_dig(cmd)
                    case Save():
                        self._handle_save(cmd)
                    case Move():
                        self._handle_move(cmd)
                    case Recharge():
                        self._handle_recharge(cmd)
                    case Observe():
                        agent = self._world.get_agent(cmd.get_agent_id())
                        if agent is None:
                            return
                        agent.remove_energy(Constants.OBSERVE_ENERGY_COST)
                    case _:
                        LOGGER.warning("Aegis received an unknown command: %s", cmd)

    def _handle_recharge(self, cmd: Recharge) -> None:
        agent = self._world.get_agent(cmd.get_agent_id())
        if agent is None:
            return
        cell = self._world.get_cell_at(agent.get_location())
        if cell and cell.is_charging_cell():
            if (
                agent.get_energy_level() + Constants.NORMAL_CHARGE
                > Constants.DEFAULT_MAX_ENERGY_LEVEL
            ):
                agent.set_energy_level(Constants.DEFAULT_MAX_ENERGY_LEVEL)
            else:
                agent.add_energy(Constants.NORMAL_CHARGE)

    def _handle_dig(self, cmd: Dig) -> None:
        agent = self._world.get_agent(cmd.get_agent_id())
        if agent is None:
            return

        cell = self._world.get_cell_at(agent.get_location())
        if cell is None:
            return

        agents_here = [aid for aid in cell.agent_id_list if self._world.get_agent(aid)]
        top_layer = cell.get_top_layer()

        if isinstance(top_layer, Rubble):
            if top_layer.agents_required <= len(agents_here) and all(
                (a := self._world.get_agent(aid)) is not None
                and a.get_energy_level() >= top_layer.energy_required
                for aid in agents_here
            ):
                self._world.remove_layer_from_cell(cell.location)
                agent.remove_energy(top_layer.energy_required)
        else:
            agent.remove_energy(Constants.DIG_ENERGY_COST)

    def _handle_move(self, cmd: Move) -> None:
        agent = self._world.get_agent(cmd.get_agent_id())
        if agent is None:
            return
        dest = agent.get_location().add(cmd.direction)
        dest_cell = self._world.get_cell_at(dest)

        if cmd.direction == Direction.CENTER:
            return

        if dest_cell:
            agent.remove_energy(dest_cell.move_cost)
            self._world.move_agent(agent.get_agent_id(), dest)
            agent.add_step_taken()
        else:
            agent.remove_energy(Constants.MOVE_ENERGY_COST)

    def _handle_save(self, cmd: Save) -> None:
        agent = self._world.get_agent(cmd.get_agent_id())
        if agent is None:
            return

        cell = self._world.get_cell_at(agent.get_location())
        if cell is None:
            return

        agents_here = [aid for aid in cell.agent_id_list if self._world.get_agent(aid)]
        gid_counter = [0] * 10
        for aid in agents_here:
            gid_counter[aid.gid] += 1

        top_layer = cell.get_top_layer()
        agent.remove_energy(Constants.SAVE_ENERGY_COST)
        if top_layer is None:
            return
        self._handle_top_layer(top_layer, cell, agents_here, gid_counter)

    def _results(self, commands: list[AgentCommand]) -> None:
        for cmd in commands:
            agent = self._world.get_agent(cmd.get_agent_id())
            if agent is None:
                continue

            energy = agent.get_energy_level()
            location = agent.get_location()
            surround_info = self._world.get_surround_info(location)

            result_commands = self._handle_command(
                cmd,
                agent,
                energy,
                location,
                surround_info,
            )

            for result in result_commands:
                agent.handle_aegis_command(result)

    def _handle_command(
        self,
        cmd: AgentCommand,
        agent: Agent,
        energy: int,
        location: Location,
        surround_info: SurroundInfo,
    ) -> list[AegisCommand]:
        match cmd:
            case Move() | Dig() | Save():
                results: list[AegisCommand] = [WorldUpdate(energy, surround_info)]
                if isinstance(cmd, Save):
                    results.extend(self._handle_save_cmd(agent))
                return results

            case Recharge():
                agent_cell = self._world.get_cell_at(location)
                success = agent_cell is not None and agent_cell.is_charging_cell()
                return [RechargeResult(energy, was_successful=success)]

            case Observe():
                cell_info, layers = CellInfo(), []
                cell = self._world.get_cell_at(cmd.location)
                if cell:
                    cell_info = cell.get_cell_info()
                    layers = cell.get_cell_layers()
                return [ObserveResult(energy, cell_info, layers)]

            case _:
                return []

    def _handle_save_cmd(self, agent: Agent) -> list[AegisCommand]:
        results: list[AegisCommand] = []
        if (
            is_feature_enabled("ENABLE_PREDICTIONS")
            and self._prediction_handler is not None
            and SaveResult is not None
        ):
            pred_info = self._prediction_handler.get_pred_info_for_agent(
                agent.get_agent_id(),
            )
            if pred_info:
                results.append(SaveResult(pred_info[0], pred_info[1], pred_info[2]))
        return results

    def _handle_top_layer(
        self,
        top_layer: WorldObject,
        cell: Cell,
        agents_here: list[AgentID],
        gid_counter: list[int],
    ) -> None:
        if isinstance(top_layer, Survivor):
            self._world.remove_layer_from_cell(cell.location)
            alive_count, dead_count = self._calculate_survivor_stats(top_layer)
            # self._assign_points(agents_here, alive_count, dead_count, gid_counter)

            if (
                is_feature_enabled("ENABLE_PREDICTIONS")
                and self._prediction_handler is not None
            ):
                self._prediction_handler.add_agent_to_no_pred_yet(
                    agents_here[0],
                    top_layer.id,
                )

        else:
            for aid in agents_here:
                agent = self._world.get_agent(aid)
                if agent is not None:
                    agent.remove_energy(Constants.SAVE_ENERGY_COST)

    def _calculate_survivor_stats(self, survivor: Survivor) -> tuple[int, int]:
        self._world.remove_survivor(survivor)
        return (1, 0) if survivor.is_alive() else (0, 1)

    def _handle_random_tie(
        self,
        alive_count: int,
        dead_count: int,
        gid_counter: list[int],
        max_group_size: int,
    ) -> None:
        while True:
            random_id = Utility.next_int() % len(gid_counter)
            if gid_counter[random_id] == max_group_size:
                if alive_count > 0:
                    state = Constants.SAVE_STATE_ALIVE
                    amount = alive_count
                else:
                    state = Constants.SAVE_STATE_DEAD
                    amount = dead_count
                # self._agent_handler.increase_agent_group_saved(random_id, amount, state)
                break

    def _handle_all_tie(
        self,
        alive_count: int,
        dead_count: int,
        gid_counter: list[int],
        max_group_size: int,
    ) -> None:
        for gid, count in enumerate(gid_counter):
            if count == max_group_size:
                if alive_count > 0:
                    state = Constants.SAVE_STATE_ALIVE
                    amount = alive_count
                else:
                    state = Constants.SAVE_STATE_DEAD
                    amount = dead_count

                # self._agent_handler.increase_agent_group_saved(gid, amount, state)
