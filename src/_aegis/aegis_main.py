import base64
import sys
from pathlib import Path
from typing import TYPE_CHECKING

from . import LOGGER
from .aegis_config import is_feature_enabled
from .agent_handler import AgentHandler
from .command_processor import CommandProcessor
from .parameters import Parameters
from .parsers.world_file_parser import WorldFileParser
from .protobuf.protobuf_service import ProtobufService
from .server_websocket import WebSocketServer
from .world.aegis_world import AegisWorld

try:
    from .agent_predictions.prediction_handler import PredictionHandler
except ImportError:
    _prediction_imported = False
else:
    _prediction_imported = True

if TYPE_CHECKING:
    from .agent import Agent
    from .agent_predictions.prediction_handler import (
        PredictionHandler as PredictionHandlerType,
    )
    from .common.commands.agent_command import AgentCommand
else:
    PredictionHandlerType = object


class Aegis:
    def __init__(self, parameters: Parameters, *, wait_for_client: bool) -> None:
        self._parameters: Parameters = parameters
        self._started_idling: int = -1
        self._end: bool = False
        self._agents: list[Agent] = []
        self._agent_handler: AgentHandler = AgentHandler()
        self._agent_commands: list[AgentCommand] = []
        self._aegis_world: AegisWorld = AegisWorld(self._agents, parameters)
        self._ws_server: WebSocketServer = WebSocketServer()
        if wait_for_client:
            self._ws_server.set_wait_for_client()
        self._prediction_handler: PredictionHandlerType | None = None
        self._command_processor: CommandProcessor = CommandProcessor(
            self._agents,
            self._aegis_world,
            self._agent_handler,
            self._prediction_handler,
        )

    def start_up(self) -> bool:
        if (
            is_feature_enabled("ENABLE_PREDICTIONS", self._parameters.config_file)
            and _prediction_imported
        ):
            self._prediction_handler = (
                PredictionHandler()  # pyright: ignore[reportPossiblyUnboundVariable]
            )

        _aegis_world_file = WorldFileParser.parse_world_file(
            Path(self._parameters.world_filename),
        )
        if _aegis_world_file is None:
            LOGGER.error(
                'Aegis  : Unable to parse world file from "%s"',
                self._parameters.world_filename,
            )
            return False
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
                error = "Agent should not be of `none` type during creation"
                raise RuntimeError(error)
            agent.load_agent(self._parameters.agent)

    def _end_simulation(self) -> None:
        LOGGER.info("Aegis  : Simulation Over.")

        serialized_data = ProtobufService.serialize_simulation_complete()
        self._compress_and_send(serialized_data)

        self._end = True
        self._ws_server.finish()

    def run(self) -> None:
        self._ws_server.start()

        rounds = self._parameters.number_of_rounds
        LOGGER.info("Aegis  : Running simulation.")
        LOGGER.info("Running for %s rounds\n", rounds)
        LOGGER.info("================================================")
        _ = sys.stdout.flush()

        world_data = self.get_aegis_world().get_protobuf_world_data()

        serialized_data = ProtobufService.serialize_round_update(
            0, world_data, self._agent_handler.get_groups_data()
        )
        self._compress_and_send(serialized_data)

        for game_round in range(1, rounds + 1):
            if self._end:
                break

            if len(self._agents) == 0:
                LOGGER.info("Aegis  : All Agents are Dead !!!")
                self._end_simulation()
                return

            survivors_saved = self._aegis_world.get_total_saved_survivors()
            total_survivors = self._aegis_world.get_num_survivors()

            if survivors_saved == total_survivors:
                LOGGER.info("Aegis  : All Survivors Saved")
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
        encoded = base64.b64encode(event).decode("utf-8")
        self._ws_server.add_event(encoded)
