import base64
import json
import logging
import random
from pathlib import Path
from typing import Any

from _aegis.aegis_config import is_feature_enabled
from _aegis.agent import Agent
from _aegis.common import (
    AgentID,
    Constants,
    Direction,
    Location,
    Utility,
)
from _aegis.common.world.cell import Cell
from _aegis.common.world.info import CellInfo, SurroundInfo
from _aegis.common.world.objects import Survivor
from _aegis.common.world.objects.rubble import Rubble
from _aegis.common.world.objects.world_object import WorldObject
from _aegis.common.world.world import World
from _aegis.parameters import Parameters
from _aegis.parsers.aegis_world_file import AegisWorldFile
from _aegis.parsers.helper.cell_info_settings import CellInfoSettings
from _aegis.parsers.helper.cell_type_info import CellTypeInfo
from _aegis.parsers.helper.world_file_type import Attributes
from _aegis.parsers.world_file_parser import WorldFileParser
from _aegis.protobuf.protobuf_service import ProtobufService
from _aegis.server_websocket import WebSocketServer

from .spawn_manager import SpawnManger

LOGGER = logging.getLogger("aegis")


class AegisWorld:
    def __init__(self, agents: list[Agent], parameters: Parameters) -> None:
        self._world_object_count: int = 0
        self._agent_locations: dict[AgentID, Location] = {}
        self._spawn_manager: SpawnManger = SpawnManger()
        self._random_seed: int = 0
        self._world: World | None = None
        self._agents: list[Agent] = agents
        self._parameters: Parameters = parameters
        self._normal_cell_list: list[Cell] = []
        self._survivors_list: dict[int, Survivor] = {}
        self._top_layer_removed_cell_list: list[Location] = []
        self._initial_agent_energy: int = Constants.DEFAULT_MAX_ENERGY_LEVEL
        self._agent_world_filename: str = ""
        self._number_of_survivors: int = 0
        self._number_of_alive_agents: int = 0
        self._number_of_dead_agents: int = 0
        self._number_of_survivors_alive: int = 0
        self._number_of_survivors_dead: int = 0
        self._number_of_survivors_saved_alive: int = 0
        self._number_of_survivors_saved_dead: int = 0
        self._max_move_cost: int = 0

    def build_world_from_file(self, filename: str, ws_server: WebSocketServer) -> bool:
        try:
            aegis_world_file_info = WorldFileParser().parse_world_file(Path(filename))
            success = self.build_world(aegis_world_file_info)

            serialized_data = ProtobufService.serialize_world_init(
                self.get_protobuf_world_data(),
            )
            encoded = base64.b64encode(serialized_data).decode("utf-8")
            ws_server.add_event(encoded)
        except (FileNotFoundError, json.JSONDecodeError, KeyError, ValueError):
            return False
        else:
            return success

    def build_world(self, aegis_world_file: AegisWorldFile | None) -> bool:
        if aegis_world_file is None:
            return False

        try:
            self._random_seed = aegis_world_file.random_seed
            self._initial_agent_energy = aegis_world_file.start_energy
            Utility.set_random_seed(aegis_world_file.random_seed)

            self._world = World(
                width=aegis_world_file.width,
                height=aegis_world_file.height,
            )

            self._setup_specials(aegis_world_file.special_cells)
            self._setup_cells(aegis_world_file.cells)
            self._populate_normal_cells_and_survivors()
            self._number_of_survivors = (
                self._number_of_survivors_alive + self._number_of_survivors_dead
            )
        except (KeyError, ValueError):
            LOGGER.exception("Error in building world")
            return False
        else:
            return True

    def _setup_specials(self, special_cells: list[CellTypeInfo]) -> None:
        if self._world is None:
            error = "World must be initialized before calling this method."
            raise RuntimeError(error)

        for special in special_cells:
            for loc in special.locs:
                cell = self._world.get_cell_at(loc)
                if cell is None:
                    continue
                cell.setup_cell(special.name)

    def _setup_cells(self, cell_stack_info: list[CellInfoSettings]) -> None:
        if self._world is None:
            error = "World must be initialized before calling this method."
            raise RuntimeError(error)

        for cell_info_setting in cell_stack_info:
            loc = cell_info_setting.location
            if not self._world.on_map(loc):
                continue

            cell = self._world.get_cell_at(loc)
            if cell is None:
                continue

            cell.move_cost = cell_info_setting.move_cost

            for content in reversed(cell_info_setting.contents):
                layer = self.create_world_object(
                    self._world_object_count, content["type"], content["arguments"]
                )
                if layer is not None:
                    cell.add_layer(layer)
                    self._world_object_count += 1

    def _populate_normal_cells_and_survivors(self) -> None:
        if self._world is None:
            error = "World must be initialized before calling this method."
            raise RuntimeError(error)

        for x in range(self._world.width):
            for y in range(self._world.height):
                cell = self._world.get_cell_at(Location(x, y))
                if cell is None:
                    continue

                if cell.is_normal_cell():
                    self._normal_cell_list.append(cell)

                for layer in cell.get_cell_layers():
                    if isinstance(layer, Survivor):
                        if layer.get_health() > 0:
                            self._number_of_survivors_alive += 1
                        else:
                            self._number_of_survivors_dead += 1

    def create_world_object(
        self, obj_id: int, type_str: str, args: dict[Attributes, int]
    ) -> WorldObject | None:
        type_upper = type_str.upper()
        try:
            if type_upper == "SV":
                energy_level = args["energy_level"]
                surv = Survivor(obj_id, energy_level)
                self._survivors_list[obj_id] = surv
                return surv

            if type_upper == "RB":
                energy_required = args["energy_required"]
                agents_required = args["agents_required"]
                return Rubble(obj_id, energy_required, agents_required)
        except KeyError:
            LOGGER.exception("Missing argument for object type '%s'", type_str)

        LOGGER.critical("Unknown or invalid object type: '%s'", type_str)
        return None

    def _build_agent_world(self) -> list[list[Cell]]:
        if self._world is None:
            error = "World must be initialized before calling this method."
            raise RuntimeError(error)

        width, height = self._world.width, self._world.height
        world: list[list[Cell]] = [
            [Cell(x, y) for y in range(height)] for x in range(width)
        ]

        for x in range(width):
            for y in range(height):
                source_cell = self._world.get_cell_at(Location(x, y))
                cell = world[x][y]

                if source_cell is None:
                    continue

                if source_cell.is_killer_cell():
                    cell.set_killer_cell()
                elif source_cell.is_charging_cell():
                    cell.set_charging_cell()
                elif source_cell.is_spawn_cell():
                    cell.set_spawn_cell()
                else:
                    cell.set_normal_cell()

                if is_feature_enabled("ENABLE_MOVE_COST"):
                    cell.move_cost = source_cell.move_cost

        return world

    def grim_reaper(self) -> list[AgentID]:
        dead_agents: list[AgentID] = []
        for agent in self._agents:
            if agent.get_energy_level() <= 0:
                LOGGER.info(
                    "Aegis  : Agent %s ran out of energy and died.\n",
                    agent.get_agent_id(),
                )
                dead_agents.append(agent.get_agent_id())
                continue

            if self._world:
                cell = self._world.get_cell_at(agent.get_location())
                if cell is None:
                    continue

                if cell.is_killer_cell():
                    LOGGER.info(
                        "Aegis  : Agent %s ran into killer cell and died.\n",
                        agent.get_agent_id(),
                    )
                    if agent.get_agent_id() not in dead_agents:
                        dead_agents.append(agent.get_agent_id())

        self._number_of_dead_agents += len(dead_agents)
        return dead_agents

    def get_agent_world_filename(self) -> str:
        return self._agent_world_filename

    def add_agent_by_id(self, agent_id: AgentID) -> Agent | None:
        if self._world is None:
            error = "World must be initialized before calling this method."
            raise RuntimeError(error)

        spawn_loc = self._spawn_manager.get_spawn_location(agent_id.gid)

        cell = self._world.get_cell_at(spawn_loc)

        if cell is None:
            if len(self._normal_cell_list) == 0:
                cell = self._world.get_cell_at(Location(0, 0))
            else:
                cell = random.choice(self._normal_cell_list)

        if cell is None:
            error = "Aegis  : No cell found for agent"
            raise RuntimeError(error)

        if cell.is_killer_cell():
            LOGGER.warning("Aegis  : agent has been placed on a killer cell!")

        world = World(self._build_agent_world())
        agent = Agent(
            world,
            self._world,
            agent_id,
            cell.location,
            self._initial_agent_energy,
            debug=self._parameters.debug,
        )
        self.add_agent(agent)
        return agent

    def add_agent(self, agent: Agent) -> None:
        if self._world is None:
            error = "World must be initialized before calling this method."
            raise RuntimeError(error)

        if agent not in self._agents:
            self._agents.append(agent)

            cell = self._world.get_cell_at(agent.get_location())
            if cell is None:
                return

            cell.agent_id_list.append(agent.get_agent_id())
            self._number_of_alive_agents += 1
            LOGGER.info("Aegis  : Added agent %s", agent.get_agent_id())

    def get_agent(self, agent_id: AgentID) -> Agent | None:
        for agent in self._agents:
            if agent.get_agent_id() == agent_id:
                return agent
        return None

    def move_agent(self, agent_id: AgentID, location: Location) -> None:
        agent = self.get_agent(agent_id)
        if agent is None or self._world is None:
            return

        curr_cell = self._world.get_cell_at(agent.get_location())
        dest_cell = self._world.get_cell_at(location)

        if dest_cell is None or curr_cell is None:
            return

        curr_cell.agent_id_list.remove(agent.get_agent_id())
        dest_cell.agent_id_list.append(agent.get_agent_id())
        agent.set_location(dest_cell.location)

    def remove_layer_from_cell(self, location: Location) -> None:
        if self._world is None:
            error = "World must be initialized before calling this method."
            raise RuntimeError(error)

        cell = self._world.get_cell_at(location)
        if cell is None:
            return

        world_object = cell.remove_top_layer()
        if world_object is None:
            return

        self._top_layer_removed_cell_list.append(location)
        if isinstance(world_object, Survivor):
            survivor = world_object
            if survivor.get_health() <= 0:
                self._number_of_survivors_saved_dead += 1
            else:
                self._number_of_survivors_saved_alive += 1

    def get_cell_at(self, location: Location) -> Cell | None:
        if self._world is not None:
            return self._world.get_cell_at(location)
        return None

    def get_surround_info(self, location: Location) -> SurroundInfo:
        if self._world is None:
            error = "World must be initialized before calling this method."
            raise RuntimeError(error)

        surround_info = SurroundInfo()

        cell = self._world.get_cell_at(location)
        if cell is None:
            error = "Agent cell shouldn't be none"
            raise RuntimeError(error)

        surround_info.set_current_info(cell.get_cell_info())

        for direction in Direction:
            cell = self._world.get_cell_at(location.add(direction))
            if cell is None:
                surround_info.set_surround_info(direction, CellInfo())
            else:
                surround_info.set_surround_info(direction, cell.get_cell_info())
        return surround_info

    def remove_survivor(self, survivor: Survivor) -> None:
        del self._survivors_list[survivor.id]

    def get_num_survivors(self) -> int:
        return self._number_of_survivors

    def get_total_saved_survivors(self) -> int:
        return (
            self._number_of_survivors_saved_alive + self._number_of_survivors_saved_dead
        )

    def get_agents(self) -> list[Agent]:
        return self._agents

    def get_protobuf_world_data(self) -> dict[str, Any]:
        if self._world is None:
            error = "World must be initialized before calling this method."
            raise RuntimeError(error)

        cells = []
        agents = []
        survivors = []

        agent_map = {
            (agent.get_agent_id().id, agent.get_agent_id().gid): agent
            for agent in self._agents
        }

        for x in range(self._world.width):
            for y in range(self._world.height):
                cell = self._world.get_cell_at(Location(x, y))
                if cell is None:
                    continue

                cell_info = cell.get_cell_info()

                # Create cell data
                cell_data = {
                    "location": {"x": x, "y": y},
                    "move_cost": cell_info.move_cost,
                    "agent_ids": [
                        {"id": aid.id, "gid": aid.gid} for aid in cell.agent_id_list
                    ],
                }

                # Add top layer if present
                top_layer = cell.get_top_layer()
                if top_layer is not None:
                    if isinstance(top_layer, Survivor):
                        cell_data["survivor"] = {
                            "id": top_layer.id,
                            "state": (
                                0 if top_layer.get_health() > 0 else 1
                            ),  # 0=alive, 1=dead
                        }
                        survivors.append(
                            {
                                "id": top_layer.id,
                                "state": 0 if top_layer.get_health() > 0 else 1,
                            }
                        )
                    else:
                        # Assume it's rubble
                        cell_data["rubble"] = {"move_cost": cell_info.move_cost}

                cells.append(cell_data)

                # Add agent data for agents in this cell
                for agent_id in cell.agent_id_list:
                    key = (agent_id.id, agent_id.gid)
                    agent = agent_map.get(key)
                    if agent is not None:
                        agent_data = {
                            "agent_id": {
                                "id": agent.get_agent_id().id,
                                "gid": agent.get_agent_id().gid,
                            },
                            "location": {"x": x, "y": y},
                            "energy_level": agent.get_energy_level(),
                            "steps_taken": agent.steps_taken,
                        }
                        agents.append(agent_data)

        return {
            "width": self._world.width,
            "height": self._world.height,
            "cells": cells,
            "agents": agents,
            "survivors": survivors,
        }
