import argparse
import base64
import gzip
import sys
import time
from dataclasses import dataclass

from _aegis.aegis_config import is_feature_enabled
from _aegis.assist.agent_states import AgentStates
from _aegis.command_processor import CommandProcessor
from _aegis.agent import Agent
from _aegis.agent_control.agent_handler import AgentHandler

from _aegis.agent_predictions.prediction_handler import PredictionHandler
from _aegis.assist.parameters import Parameters
from _aegis.assist.state import State
from _aegis.common.commands.agent_command import AgentCommand
from _aegis.parsers.world_file_parser import WorldFileParser
from _aegis.server_websocket import WebSocketServer
from _aegis.world.aegis_world import AegisWorld
from _aegis.protobuf.protobuf_service import ProtobufService


@dataclass
class Args:
    agent_amount: int
    replay_file: str
    world_file: str
    rounds: int
    client: bool
    agent: str
    group_name: str


class Aegis:
    def __init__(self) -> None:
        self._parameters: Parameters = Parameters()
        self._state: State = State.NONE
        self._started_idling: int = -1
        self._end: bool = False
        self._agents: list[Agent] = []
        self._agent_handler: AgentHandler = AgentHandler()
        self._agent_commands: list[AgentCommand] = []
        self._aegis_world: AegisWorld = AegisWorld(self._agents)
        self._ws_server: WebSocketServer = WebSocketServer()
        self._prediction_handler: PredictionHandler | None = None
        self._command_processor: CommandProcessor = CommandProcessor(
            self._agents,
            self._aegis_world,
            self._agent_handler,
            self._prediction_handler,
        )

    def read_command_line(self) -> bool:
        parser = argparse.ArgumentParser(
            description="AEGIS Simulation Configuration",
        )

        _ = parser.add_argument(
            "--agent-amount",
            dest="agent_amount",
            type=int,
            default=1,
            help="Number of agent instances to run",
        )
        _ = parser.add_argument(
            "--world-file",
            dest="world_file",
            type=str,
            required=True,
            help="Indicates the file AEGIS should use to build the world from upon startup.",
        )
        _ = parser.add_argument(
            "--rounds",
            type=int,
            required=True,
            help="Number of simulation rounds",
        )
        _ = parser.add_argument(
            "--agent",
            dest="agent",
            type=str,
            required=True,
            help="Path to the agent file",
        )
        _ = parser.add_argument(
            "--group-name",
            dest="group_name",
            type=str,
            required=True,
            help="Group name",
        )
        _ = parser.add_argument(
            "--client",
            action="store_true",
            required=False,
            help="Set to true to wait for client to connect.",
        )

        try:
            args: Args = parser.parse_args()  # pyright: ignore[reportAssignmentType]

            if args.agent_amount > 0:
                self._parameters.number_of_agents = args.agent_amount
            if args.world_file:
                self._parameters.world_filename = args.world_file
            if args.rounds > 0:
                self._parameters.number_of_rounds = args.rounds
            if args.agent:
                self._parameters.agent = args.agent
            if args.group_name:
                self._parameters.group_name = args.group_name
            if args.client:
                self._ws_server.set_wait_for_client(args.client)

            return True
        except SystemExit:
            return False

    def start_up(self) -> bool:
        if is_feature_enabled("ENABLE_PREDICTIONS"):
            self._prediction_handler = PredictionHandler()
        try:
            _aegis_world_file = WorldFileParser.parse_world_file(self._parameters.world_filename)
            if _aegis_world_file is None:
                print(
                    f'Aegis  : Unable to parse world file from "{self._parameters.world_filename}"',
                    file=sys.stderr,
                )
                return False
        except Exception:
            print(
                f'Aegis  : Unable to parse world file from "{self._parameters.world_filename}"',
                file=sys.stderr,
            )
            return False

        self._state = State.IDLE
        self._started_idling = 0
        return True

    def build_world(self) -> bool:
        return self._aegis_world.build_world_from_file(
            self._parameters.world_filename, self._ws_server
        )

    def shutdown(self) -> None:
        self._agent_handler.print_group_survivor_saves()

    def start_agents(self) -> None:
        for _ in range(self._parameters.number_of_agents):
            agent_id = self._agent_handler.agent_info(self._parameters.group_name)
            agent = self._aegis_world.add_agent_by_id(agent_id)
            if agent is None:
                raise Exception("Agent should not be of `none` type during creation")
            agent.set_agent_state(AgentStates.CONNECTED)
            agent.load_agent(self._parameters.agent)
        self._state = State.RUN_SIMULATION

    def _end_simulation(self) -> None:
        print("Aegis  : Simulation Over.")

        serialized_data = ProtobufService.serialize_simulation_complete()
        self._compress_and_send(serialized_data)

        self._state = State.SHUT_DOWN
        self._end = True
        self._ws_server.finish()

    def run_state(self) -> None:
        match self._state:
            case State.IDLE:
                if self._started_idling == 0:
                    self._started_idling = time.time_ns() // 1_000_000
                else:
                    current_time = time.time_ns() // 1_000_000
                    diff = (current_time - self._started_idling) // 1000
                    if diff >= 300:
                        print(
                            "Aegis  : AEGIS has been idle for too long and will now shut down.",
                            file=sys.stderr,
                        )
                        self._end_simulation()
            case State.RUN_SIMULATION:
                self._run_simulation()
            case State.SHUT_DOWN:
                self._end_simulation()
            case _:
                pass

    def _run_simulation(self) -> None:
        self._ws_server.start()
        print("Aegis  : Running simulation.")

        if len(self._agents) == 0:
            print("Aegis  : No Agents Connected to Aegis!")
            self._end_simulation()
            return

        print(f"Running for {self._parameters.number_of_rounds} rounds\n")
        print("================================================")
        _ = sys.stdout.flush()

        world_data = self.get_aegis_world().get_protobuf_world_data()

        serialized_data = ProtobufService.serialize_round_update(
            0, world_data, self._agent_handler.get_groups_data()
        )
        self._compress_and_send(serialized_data)

        for game_round in range(1, self._parameters.number_of_rounds + 1):
            if self._end:
                break

            if self._state == State.SHUT_DOWN:
                print("Aegis  : AEGIS has shutdown.")
                self._end_simulation()
                return

            if len(self._agents) == 0:
                print("Aegis  : All Agents are Dead !!!")
                self._end_simulation()
                return

            survivors_saved = self._aegis_world.get_total_saved_survivors()
            total_survivors = self._aegis_world.get_num_survivors()

            if survivors_saved == total_survivors:
                print("Aegis  : All Survivors Saved")
                self._end_simulation()
                return

            self._command_processor.run_turn()
            self._grim_reaper()
            world_data = self.get_aegis_world().get_protobuf_world_data()

            serialized_data = ProtobufService.serialize_round_update(
                game_round, world_data, self._agent_handler.get_groups_data()
            )
            self._compress_and_send(serialized_data)

        self._end_simulation()

    # TODO: Move th predict and messages to `command_processor.py`

    # def _process_command(self, command: AgentCommand) -> None:
    #     if isinstance(command, PREDICT):
    #         self._PREDICT_list.append(command)
    #
    # def _process_PREDICT(self) -> None:
    #     for prediction in self._PREDICT_list:
    #         agent = self._aegis_world.get_agent(prediction.get_agent_id())
    #         if agent is None:
    #             continue
    #
    #         if self._prediction_handler is not None:
    #             # does aegis recognize a saved surv with no prediction for this agents group?
    #             if self._prediction_handler.is_group_in_no_pred_yet(
    #                 agent.get_agent_id().gid, prediction.surv_id
    #             ):
    #                 # was this agent a part of the saving?
    #                 if self._prediction_handler.is_agent_in_saving_group(
    #                     agent.get_agent_id(), prediction.surv_id
    #                 ):
    #                     # record prediction result! (group, surv id entry is removed from no_pred_yet in set_pred_res)
    #                     correct_prediction = (
    #                         self._prediction_handler.check_agent_prediction(
    #                             agent.get_agent_id(),
    #                             prediction.surv_id,
    #                             prediction.label,
    #                         )
    #                     )
    #                     self._prediction_handler.set_prediction_result(
    #                         agent.get_agent_id(),
    #                         prediction.surv_id,
    #                         correct_prediction,
    #                     )
    #
    #                     self._agent_handler.increase_agent_group_predicted(
    #                         agent.get_agent_id().gid,
    #                         prediction.surv_id,
    #                         prediction.label,
    #                         correct_prediction,
    #                     )
    #
    #         self._PREDICT_RESULT_list.add(agent.get_agent_id())
    #     self._PREDICT_list.clear()
    #
    # def _create_results(self) -> None:
    #     if (
    #         self._parameters.config_settings is not None
    #         and self._parameters.config_settings.predictions_enabled
    #         and self._prediction_handler is not None
    #     ):
    #         for agent_id in self._PREDICT_RESULT_list:
    #             agent = self._aegis_world.get_agent(agent_id)
    #             if agent is None:
    #                 continue
    #
    #             # see if this agent (not group!) made a prediction and return its result
    #             #    IMPORTANT    if they made a prediction, but another agent in their group beat them to it, they wont get a result for their prediction!!!
    #             pred_res_info = self._prediction_handler.get_prediction_result(
    #                 agent.get_agent_id()
    #             )
    #             if pred_res_info is not None:
    #                 prediction_result = PREDICT_RESULT(
    #                     pred_res_info[0], pred_res_info[1]
    #                 )
    #             else:
    #                 prediction_result = PREDICT_RESULT(-1, False)
    #
    #             # self._agent_handler.set_result_of_command(
    #             #     agent.get_agent_id(), prediction_result
    #             # )
    #
    #         self._PREDICT_RESULT_list.clear()

    def _grim_reaper(self) -> None:
        dead_agents = self._aegis_world.grim_reaper()

        for agent_id in dead_agents:
            agent = self._aegis_world.get_agent(agent_id)
            if agent is None:
                continue
            self._agents.remove(agent)

    def get_aegis_world(self) -> AegisWorld:
        return self._aegis_world

    def _compress_and_send(self, event: bytes) -> None:
        compressed_event = gzip.compress(event)
        encoded_event = base64.b64encode(compressed_event).decode().encode()
        self._ws_server.add_event(encoded_event)
