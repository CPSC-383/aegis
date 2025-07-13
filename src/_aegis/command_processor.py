from _aegis.aegis_config import is_feature_enabled
from _aegis.agent_control.agent_handler import AgentHandler
from _aegis.agent_predictions.prediction_handler import PredictionHandler
from _aegis.common.agent_id import AgentID
from _aegis.common.commands.aegis_commands import (
    AEGIS_UNKNOWN,
    MOVE_RESULT,
    OBSERVE_RESULT,
    RECHARGE_RESULT,
    SAVE_SURV_RESULT,
    SEND_MESSAGE_RESULT,
    TEAM_DIG_RESULT,
)
from _aegis.common.commands.agent_command import AgentCommand
from _aegis.common.commands.agent_commands import (
    MOVE,
    OBSERVE,
    PREDICT,
    SEND_MESSAGE,
    RECHARGE,
    TEAM_DIG,
)
from _aegis.common.commands.agent_commands.SAVE_SURV import SAVE_SURV
from _aegis.common.constants import Constants
from _aegis.common.direction import Direction
from _aegis.common.utility import Utility
from _aegis.common.world.cell import Cell
from _aegis.common.world.info.cell_info import CellInfo
from _aegis.common.world.objects.rubble import Rubble
from _aegis.common.world.objects.survivor import Survivor
from _aegis.common.world.objects.world_object import WorldObject
from _aegis.agent import Agent
from _aegis.world.aegis_world import AegisWorld


class CommandProcessor:
    def __init__(
        self,
        agents: list[Agent],
        aegis_world: AegisWorld,
        agent_handler: AgentHandler,
        prediction_handler: PredictionHandler | None,
    ) -> None:
        self._agents: list[Agent] = agents
        self._world: AegisWorld = aegis_world
        self._agent_handler: AgentHandler = agent_handler
        self._prediction_handler: PredictionHandler | None = prediction_handler

    def run_turn(self) -> None:
        commands: list[AgentCommand] = []
        messages: list[SEND_MESSAGE] = []

        for agent in self._agents:
            agent.run()
            command = agent.get_command()
            if command is not None:
                commands.append(command)

            messages.extend(agent.get_messages())

        self._process(commands)
        self._route_messages(messages)
        self._results(commands)

    def _route_messages(self, messages: list[SEND_MESSAGE]) -> None:
        for message in messages:
            sender_id = message.get_agent_id()
            sender = self._world.get_agent(sender_id)

            if sender is None:
                continue

            recipients = message.agent_id_list

            if recipients.size() == 0:
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
                res = SEND_MESSAGE_RESULT(sender_id, recipients, message.message)
                recipient.handle_aegis_command(res)

    def _process(self, commands: list[AgentCommand]) -> None:
        for cmd in commands:
            agent_id = cmd.get_agent_id()
            agent = self._world.get_agent(agent_id)
            if agent is None:
                continue

            match cmd:
                case TEAM_DIG():
                    self._handle_dig(cmd)
                case SAVE_SURV():
                    self._handle_save(cmd)
                case PREDICT() if is_feature_enabled("ENABLE_PREDICTIONS"):
                    pass
                case MOVE():
                    self._handle_move(cmd)
                case RECHARGE():
                    self._handle_recharge(cmd)
                case OBSERVE():
                    agent = self._world.get_agent(cmd.get_agent_id())
                    if agent is None:
                        return
                    agent.remove_energy(Constants.OBSERVE_ENERGY_COST)
                case _:
                    raise Exception("Got unknown command")

    def _handle_recharge(self, cmd: RECHARGE) -> None:
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

    def _handle_dig(self, cmd: TEAM_DIG) -> None:
        agent = self._world.get_agent(cmd.get_agent_id())
        if agent is None:
            return

        cell = self._world.get_cell_at(agent.get_location())
        if cell is None:
            return

        agents_here = [aid for aid in cell.agent_id_list if self._world.get_agent(aid)]
        top_layer = cell.get_top_layer()

        if isinstance(top_layer, Rubble):
            if top_layer.remove_agents <= len(agents_here) and all(
                (a := self._world.get_agent(aid)) is not None
                and a.get_energy_level() >= top_layer.remove_energy
                for aid in agents_here
            ):
                self._world.remove_layer_from_cell(cell.location)
                agent.remove_energy(top_layer.remove_energy)
        else:
            agent.remove_energy(Constants.TEAM_DIG_ENERGY_COST)

    def _handle_move(self, cmd: MOVE) -> None:
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

    def _handle_save(self, cmd: SAVE_SURV) -> None:
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
        for aid in agents_here:
            other = self._world.get_agent(aid)
            if other is None:
                continue
            other.remove_energy(Constants.SAVE_SURV_ENERGY_COST)
            if top_layer is None:
                continue
            else:
                self._handle_top_layer(top_layer, cell, agents_here, gid_counter)

    def _results(self, commands: list[AgentCommand]) -> None:
        for cmd in commands:
            agent = self._world.get_agent(cmd.get_agent_id())
            if agent is None:
                continue

            energy = agent.get_energy_level()
            location = agent.get_location()
            surround_info = self._world.get_surround_info(location)
            if surround_info is None:
                result = AEGIS_UNKNOWN()
            else:
                match cmd:
                    case MOVE():
                        result = MOVE_RESULT(energy, surround_info)
                    case SAVE_SURV():
                        pred_info = None
                        if (
                            is_feature_enabled("ENABLE_PREDICTIONS")
                            and self._prediction_handler is not None
                        ):
                            pred_info = (
                                self._prediction_handler.get_pred_info_for_agent(
                                    agent.get_agent_id()
                                )
                            )
                        result = SAVE_SURV_RESULT(energy, surround_info, pred_info)
                    case TEAM_DIG():
                        result = TEAM_DIG_RESULT(energy, surround_info)
                    case RECHARGE():
                        agent_cell = self._world.get_cell_at(location)
                        success = (
                            agent_cell is not None and agent_cell.is_charging_cell()
                        )
                        result = RECHARGE_RESULT(success, energy)
                    case OBSERVE():
                        cell_info = CellInfo()
                        layers: list[WorldObject] = []
                        cell = self._world.get_cell_at(cmd.location)
                        if cell is not None:
                            cell_info = cell.get_cell_info()
                            layers = cell.get_cell_layers()

                        result = OBSERVE_RESULT(energy, cell_info, layers)
                    case _:
                        result = AEGIS_UNKNOWN()
            agent.handle_aegis_command(result)

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
            self._assign_points(agents_here, alive_count, dead_count, gid_counter)

            if (
                is_feature_enabled("ENABLE_PREDICTIONS")
                and self._prediction_handler is not None
            ):
                self._prediction_handler.add_agent_to_no_pred_yet(
                    agents_here[0], top_layer.id
                )

        else:
            for aid in agents_here:
                agent = self._world.get_agent(aid)
                if agent is not None:
                    agent.remove_energy(Constants.SAVE_SURV_ENERGY_COST)

    def _calculate_survivor_stats(self, survivor: Survivor) -> tuple[int, int]:
        self._world.remove_survivor(survivor)
        return (1, 0) if survivor.is_alive() else (0, 1)

    def _assign_points(
        self,
        _agents_here: list[AgentID],
        alive_count: int,
        dead_count: int,
        gid_counter: list[int],
    ) -> None:
        # points_config = self._parameters.config_settings.points_for_saving_survivors
        # points_tie_config = (
        #     self._parameters.config_settings.points_for_saving_survivors_tie
        # )

        # if points_config == ConfigSettings.POINTS_FOR_ALL_SAVING_GROUPS:
        for gid, count in enumerate(gid_counter):
            if count > 0:
                if alive_count > 0:
                    state = Constants.SAVE_STATE_ALIVE
                    amount = alive_count
                else:
                    state = Constants.SAVE_STATE_DEAD
                    amount = dead_count
                self._agent_handler.increase_agent_group_saved(gid, amount, state)

        # elif points_config == ConfigSettings.POINTS_FOR_RANDOM_SAVING_GROUPS:
        #     random_id = temp_cell_agent_list[
        #         Utility.next_int() % len(temp_cell_agent_list)
        #     ]
        #     if alive_count > 0:
        #         state = Constants.SAVE_STATE_ALIVE
        #         amount = alive_count
        #     else:
        #         state = Constants.SAVE_STATE_DEAD
        #         amount = dead_count
        #     self._agent_handler.increase_agent_group_saved(random_id.gid, amount, state)
        # elif points_config == ConfigSettings.POINTS_FOR_LARGEST_SAVING_GROUPS:
        #     largest_group_gid = 0
        #     max_group_size = 0
        #     tie = False
        #
        #     for gid, count in enumerate(gid_counter):
        #         if count > max_group_size:
        #             largest_group_gid = gid
        #             max_group_size = count
        #
        #     for gid, count in enumerate(gid_counter):
        #         if gid != largest_group_gid and count == max_group_size:
        #             tie = True
        #             break
        #
        #     if not tie:
        #         if alive_count > 0:
        #             state = Constants.SAVE_STATE_ALIVE
        #             amount = alive_count
        #         else:
        #             state = Constants.SAVE_STATE_DEAD
        #             amount = dead_count
        #         self._agent_handler.increase_agent_group_saved(
        #             largest_group_gid,
        #             amount,
        #             state,
        #         )
        #     else:
        #         if points_tie_config == ConfigSettings.POINTS_TIE_RANDOM_SAVING_GROUPS:
        #             self._handle_random_tie(
        #                 alive_count, dead_count, gid_counter, max_group_size
        #             )
        #         elif points_tie_config == ConfigSettings.POINTS_TIE_ALL_SAVING_GROUPS:
        #             self._handle_all_tie(
        #                 alive_count, dead_count, gid_counter, max_group_size
        #             )
        #
        # for agent_on_cell_id in temp_cell_agent_list:
        #     agent = self._aegis_world.get_agent(agent_on_cell_id)
        #     if agent is not None:
        #         agent.remove_energy(self._parameters.SAVE_SURV_ENERGY_COST)
        #         self._SAVE_SURV_RESULT_list.add(agent_on_cell_id)

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
                self._agent_handler.increase_agent_group_saved(random_id, amount, state)
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

                self._agent_handler.increase_agent_group_saved(gid, amount, state)
