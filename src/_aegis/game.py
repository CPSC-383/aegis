import base64
import sys
from typing import TYPE_CHECKING

from .aegis_world import AegisWorld
from .command_processor import CommandProcessor
from .logger import LOGGER
from .parsers.args_parser import Args
from .protobuf.protobuf_service import ProtobufService
from .server_websocket import WebSocketServer

# try:
#     from .agent_predictions.prediction_handler import PredictionHandler
# except ImportError:
#     _prediction_imported = False
# else:
#     _prediction_imported = True

if TYPE_CHECKING:
    from .agent import Agent
    from .agent_predictions.prediction_handler import (
        PredictionHandler as PredictionHandlerType,
    )
    from .common.commands.agent_command import AgentCommand
else:
    PredictionHandlerType = object


class Game:
    def __init__(self, args: Args) -> None:
        self._args: Args = args
        self._started_idling: int = -1
        self._agents: list[Agent] = []
        self._agent_commands: list[AgentCommand] = []
        self._aegis_world: AegisWorld = AegisWorld(self._agents, args)
        self._ws_server: WebSocketServer = WebSocketServer()
        if args.client:
            self._ws_server.set_wait_for_client()
        self._prediction_handler: PredictionHandlerType | None = None
        self._command_processor: CommandProcessor = CommandProcessor(
            self._agents,
            self._aegis_world,
            self._prediction_handler,
        )

    # def start_up(self) -> bool:
    #     if (
    #         is_feature_enabled("ENABLE_PREDICTIONS", self._args.config)
    #         and _prediction_imported
    #     ):
    #         self._prediction_handler = (
    #             PredictionHandler()  # pyright: ignore[reportPossiblyUnboundVariable]
    #         )
    #
    #     _aegis_world_file = WorldFileParser.parse_world_file(
    #         Path(self._parameters.world_filename),
    #     )
    #     if _aegis_world_file is None:
    #         LOGGER.error(
    #             'Aegis  : Unable to parse world file from "%s"',
    #             self._parameters.world_filename,
    #         )
    #         return False
    #     return True

    def build_world(self) -> bool:
        return self._aegis_world.build_world_from_file(
            self._args.world, self._ws_server
        )

    def _end_simulation(self, last_round: int) -> None:
        LOGGER.info("Aegis  : Simulation Over. Final Round: %s", last_round)

        serialized_data = ProtobufService.serialize_simulation_complete()
        self._compress_and_send(serialized_data)

        self._ws_server.finish()
        self._print_results()

    def run(self) -> None:
        self._ws_server.start()

        rounds = self._args.rounds
        LOGGER.info("Aegis  : Running simulation.")
        LOGGER.info("Running for %s rounds\n", rounds)
        LOGGER.info("================================================")
        _ = sys.stdout.flush()

        # world_data = self.get_aegis_world().get_protobuf_world_data()
        # serialized_data = ProtobufService.serialize_round_update(
        #     0, world_data, self._agent_handler.get_groups_data()
        # )
        # self._compress_and_send(serialized_data)

        for game_round in range(1, rounds + 1):
            self._command_processor.run_turn()
            self._grim_reaper()

            # world_data = self.get_aegis_world().get_protobuf_world_data()
            # serialized_data = ProtobufService.serialize_round_update(
            #     game_round, world_data, self._agent_handler.get_groups_data()
            # )
            # self._compress_and_send(serialized_data)

            if self._is_game_over():
                self._end_simulation(game_round)
                return

        self._end_simulation(self._args.rounds)

    def _is_game_over(self) -> bool:
        if len(self._agents) == 0:
            LOGGER.info("Aegis  : All Agents are Dead !!!")
            return True

        survivors_saved = self._aegis_world.get_total_saved_survivors()
        total_survivors = self._aegis_world.get_num_survivors()
        if survivors_saved == total_survivors:
            LOGGER.info("Aegis  : All Survivors Saved")
            return True

        return False

    def _grim_reaper(self) -> None:
        dead_agents = self._aegis_world.grim_reaper()

        for agent_id in dead_agents:
            agent = self._aegis_world.get_agent(agent_id)
            if agent is None:
                continue
            self._agents.remove(agent)

    def _compress_and_send(self, event: bytes) -> None:
        encoded = base64.b64encode(event).decode("utf-8")
        self._ws_server.add_event(encoded)

    def _print_results(self) -> None:
        LOGGER.info("=================================================")
        LOGGER.info("Results for each Group")
        LOGGER.info("(Score, Number Saved, Correct Predictions)")
        LOGGER.info("=================================================")
        # for group in self.agent_group_list:
        #     LOGGER.info(
        #         "%s : (%s, %s, %s)",
        #         group.name,
        #         group.score,
        #         group.number_saved,
        #         group.number_predicted_right,
        #     )
