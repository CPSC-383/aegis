import json
import os
import queue
import random
from typing import TypedDict, cast, Dict, Any

from _aegis.assist.state import State
from _aegis.common import (
    AgentID,
    Constants,
    Direction,
    Location,
    Utility,
)
from _aegis.agent import Agent
from _aegis.common.world.cell import Cell
from _aegis.common.world.info import CellInfo, SurroundInfo
from _aegis.common.world.objects import Survivor
from _aegis.common.world.world import World
from _aegis.aegis_config import is_feature_enabled
from _aegis.parsers.aegis_parser import AegisParser
from _aegis.parsers.aegis_world_file import AegisWorldFile
from _aegis.parsers.helper.world_file_type import StackContent, WorldFileType
from _aegis.parsers.world_file_parser import WorldFileParser
from _aegis.server_websocket import WebSocketServer
from _aegis.world.object_handlers import (
    ObjectHandler,
    RubbleHandler,
    SurvivorHandler,
)
from _aegis.world.simulators.survivor_simulator import SurvivorSimulator
from _aegis.world.spawn_manager import SpawnManger
from _aegis.protobuf.protobuf_service import ProtobufService


class LocationDict(TypedDict):
    x: int
    y: int


class Stack(TypedDict):
    cell_loc: LocationDict
    move_cost: int
    contents: list[StackContent]


class CellDict(TypedDict):
    cell_type: str
    stack: Stack


class AgentInfoDict(TypedDict):
    id: int
    gid: int
    x: int
    y: int
    energy_level: int
    command_sent: str
    steps_taken: int


class WorldDict(TypedDict):
    cell_data: list[CellDict]
    agent_data: list[AgentInfoDict]
    top_layer_rem_data: list[LocationDict]
    number_of_alive_agents: int
    number_of_dead_agents: int
    number_of_survivors: int
    number_of_survivors_alive: int
    number_of_survivors_dead: int
    number_of_survivors_saved_alive: int
    number_of_survivors_saved_dead: int


class AegisWorld:
    def __init__(self, agents: list[Agent]) -> None:
        self._object_handlers: dict[str, ObjectHandler] = {}
        self.install_object_handler(RubbleHandler())
        self.install_object_handler(SurvivorHandler())
        self._agent_locations: dict[AgentID, Location] = {}
        self._spawn_manager: SpawnManger = SpawnManger()
        self._random_seed: int = 0
        self._world: World | None = None
        self._agents: list[Agent] = agents
        self._normal_cell_list: list[Cell] = []
        self._survivors_list: dict[int, Survivor] = {}
        self._top_layer_removed_cell_list: list[Location] = []
        self._survivor_simulator: SurvivorSimulator = SurvivorSimulator(self._survivors_list)
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
        self._states: queue.Queue[State] = queue.Queue()

    def build_world_from_file(self, filename: str, ws_server: WebSocketServer) -> bool:
        try:
            aegis_world_file_info = WorldFileParser().parse_world_file(filename)
            success = self.build_world(aegis_world_file_info)

            serialized_data = ProtobufService.serialize_world_init(self.get_protobuf_world_data())
            ws_server.add_event(serialized_data)
            return success
        except Exception:
            return False

    def build_world(self, aegis_world_file: AegisWorldFile | None) -> bool:
        if aegis_world_file is None:
            return False
        try:
            # This is so spawn_manager can error check the spawn zones
            for spawn in aegis_world_file.agent_spawn_locations:
                self._spawn_manager.add_spawn_zone(spawn)
            self._random_seed = aegis_world_file.random_seed
            self._initial_agent_energy = aegis_world_file.initial_agent_energy
            Utility.set_random_seed(aegis_world_file.random_seed)

            # Create a world of known size
            self._world = World(width=aegis_world_file.width, height=aegis_world_file.height)

            # Special type cells
            for cell_setting in aegis_world_file.cell_settings:
                if not cell_setting.locs:
                    continue
                for loc in cell_setting.locs:
                    cell = self._world.get_cell_at(loc)
                    if cell is None:
                        continue
                    cell.setup_cell(cell_setting.name)

            # cell info (move_cost and contents)
            for cell_info_setting in aegis_world_file.cell_stack_info:
                if not self._world.on_map(cell_info_setting.location):
                    continue

                cell = self._world.get_cell_at(cell_info_setting.location)
                if cell is None:
                    continue
                cell.move_cost = cell_info_setting.move_cost

                # reverse so the top of the stack is actually
                # the top declared in the world file
                cell_info_setting.contents.reverse()
                for content in cell_info_setting.contents:
                    object_handler = self._object_handlers.get(content["type"].upper())
                    if not object_handler:
                        continue

                    layer = object_handler.create_world_object(content["arguments"])
                    if layer is not None:
                        cell.add_layer(layer)

            # Cells that are normal
            for x in range(self._world.width):
                for y in range(self._world.height):
                    cell = self._world.get_cell_at(Location(x, y))
                    if cell is None:
                        continue

                    if cell.is_normal_cell():
                        self._normal_cell_list.append(cell)

            survivor_handler = cast(SurvivorHandler, self._object_handlers.get("SV"))

            self._number_of_survivors_alive = survivor_handler.alive
            self._number_of_survivors_dead = survivor_handler.dead

            self._number_of_survivors = (
                self._number_of_survivors_alive + self._number_of_survivors_dead
            )
            self._survivors_list = survivor_handler.sv_map
            self._write_agent_world_file()
            return True
        except Exception as e:
            print(f"Error in building world: {e}")
            return False

    def install_object_handler(self, object_handler: ObjectHandler) -> None:
        keys = object_handler.get_keys()
        for key in keys:
            self._object_handlers[key.upper()] = object_handler

    def _write_agent_world_file(self) -> None:
        try:
            file = "WorldInfoFile.out"
            with open(file, "w") as writer:
                if self._world is None:
                    return

                width = self._world.width
                height = self._world.height
                _ = writer.write(f"Size: ( WIDTH {width} , HEIGHT {height} )\n")
                for x in range(self._world.width):
                    for y in range(self._world.height):
                        cell = self._world.get_cell_at(Location(x, y))
                        if cell is None:
                            _ = writer.write(f"[({x},{y}),No Cell]\n")
                            continue

                        has_survivors = True
                        if cell.number_of_survivors() <= 0:
                            has_survivors = False

                        killer = "+K" if cell.is_killer_cell() else "-K"
                        charging = "+C" if cell.is_charging_cell() else "-C"

                        if is_feature_enabled("ENABLE_MOVE_COST"):
                            _ = writer.write(
                                f"[({x},{y}),({killer},{charging}),{has_survivors},{cell.move_cost}]\n"
                            )
                        else:
                            _ = writer.write(f"[({x},{y}),({killer},{charging}),{has_survivors}]\n")
            path = os.path.realpath(os.getcwd())
            self._agent_world_filename = os.path.join(path, file)
        except Exception:
            print(f"Aegis  : Unable to write agent world file to '{self._agent_world_filename}'!")

    def grim_reaper(self) -> list[AgentID]:
        dead_agents: list[AgentID] = []
        for agent in self._agents:
            if agent.get_energy_level() <= 0:
                print(f"Aegis  : Agent {agent.get_agent_id()} ran out of energy and died.\n")
                dead_agents.append(agent.get_agent_id())
                continue

            if self._world:
                cell = self._world.get_cell_at(agent.get_location())
                if cell is None:
                    continue

                if cell.is_killer_cell():
                    print(f"Aegis  : Agent {agent.get_agent_id()} ran into killer cell and died.\n")
                    if agent.get_agent_id() not in dead_agents:
                        dead_agents.append(agent.get_agent_id())

        self._number_of_dead_agents += len(dead_agents)
        return dead_agents

    def get_agent_world_filename(self) -> str:
        return self._agent_world_filename

    def add_agent_by_id(self, agent_id: AgentID) -> Agent | None:
        if self._world is None:
            return

        spawn_loc = self._spawn_manager.get_spawn_location(agent_id.gid)

        cell = self._world.get_cell_at(spawn_loc)

        if cell is None:
            if len(self._normal_cell_list) == 0:
                cell = self._world.get_cell_at(Location(0, 0))
            else:
                cell = random.choice(self._normal_cell_list)

        if cell is None:
            raise Exception("Aegis  : No cell found for agent")

        if cell.is_killer_cell():
            print("Aegis  : Warning, agent has been placed on a killer cell!")

        agent = Agent()
        agent.set_agent_id(agent_id)
        agent.set_location(cell.location)
        agent.set_energy_level(self._initial_agent_energy)
        agent.set_world(World(AegisParser.build_world(self._agent_world_filename)))
        self.add_agent(agent)
        return agent

    def add_agent(self, agent: Agent) -> None:
        if agent not in self._agents:
            self._agents.append(agent)
            if self._world is None:
                return

            cell = self._world.get_cell_at(agent.get_location())
            if cell is None:
                return

            cell.agent_id_list.append(agent.get_agent_id())
            self._number_of_alive_agents += 1
            print(f"Aegis  : Added agent {agent}")

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
            return

        cell = self._world.get_cell_at(location)
        if cell is None:
            return

        world_object = cell.remove_top_layer()
        if world_object is None:
            return

        self._top_layer_removed_cell_list.append(location)
        if isinstance(world_object, Survivor):
            survivor = world_object
            if survivor.get_energy_level() <= 0:
                self._number_of_survivors_saved_dead += 1
            else:
                self._number_of_survivors_saved_alive += 1

    def get_cell_at(self, location: Location) -> Cell | None:
        if self._world is not None:
            return self._world.get_cell_at(location)
        return None

    def get_surround_info(self, location: Location) -> SurroundInfo | None:
        surround_info = SurroundInfo()
        if self._world is None:
            return
        cell = self._world.get_cell_at(location)
        if cell is None:
            return
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

    def _get_json_world(self, filename: str) -> WorldFileType:
        with open(filename, "r") as file:
            world = cast(WorldFileType, json.load(file))
        return world

    def convert_to_json(self) -> WorldDict:
        if self._world is None:
            raise Exception(
                "Aegis  : World is not initialized! Cannot send world object to client!"
            )

        agent_data: list[AgentInfoDict] = []
        cell_data: list[CellDict] = []
        top_layer_rem_data: list[LocationDict] = []
        agent_map = {
            (
                agent.get_agent_id().id,
                agent.get_agent_id().gid,
            ): agent
            for agent in self._agents
        }

        for x in range(self._world.width):
            for y in range(self._world.height):
                cell = self._world.get_cell_at(Location(x, y))
                if cell is None:
                    continue

                cell_info = cell.get_cell_info()
                cell_layers = cell.get_cell_layers()

                cell_dict: CellDict = {
                    "cell_type": str(cell_info.cell_type),
                    "stack": {
                        "cell_loc": {"x": x, "y": y},
                        "move_cost": cell_info.move_cost,
                        "contents": [layer.json() for layer in cell_layers],
                    },
                }
                cell_data.append(cell_dict)

                for agent_id in cell.agent_id_list:
                    key = (agent_id.id, agent_id.gid)
                    agent = agent_map.get(key)

                    if agent is not None:
                        cmd = str(c) if (c := agent.get_command()) is not None else ""
                        agent_dict: AgentInfoDict = {
                            "id": agent.get_agent_id().id,
                            "gid": agent.get_agent_id().gid,
                            "x": x,
                            "y": y,
                            "energy_level": agent.get_energy_level(),
                            "command_sent": cmd,
                            "steps_taken": agent.steps_taken,
                        }
                        agent_data.append(agent_dict)

        for top_layer in self._top_layer_removed_cell_list:
            top_dict: LocationDict = {"x": top_layer.x, "y": top_layer.y}
            top_layer_rem_data.append(top_dict)

        world_dict: WorldDict = {
            "cell_data": cell_data,
            "agent_data": agent_data,
            "top_layer_rem_data": top_layer_rem_data,
            "number_of_alive_agents": self._number_of_alive_agents,
            "number_of_dead_agents": self._number_of_dead_agents,
            "number_of_survivors": self._number_of_survivors,
            "number_of_survivors_alive": self._number_of_survivors_alive,
            "number_of_survivors_dead": self._number_of_survivors_dead,
            "number_of_survivors_saved_alive": self._number_of_survivors_saved_alive,
            "number_of_survivors_saved_dead": self._number_of_survivors_saved_dead,
        }

        return world_dict

    def set_state(self, state: State) -> None:
        self._states.put(state)

    def get_state(self) -> State:
        if self._states.empty():
            return State.NONE
        try:
            return self._states.get(block=True)
        except queue.Empty:
            return State.NONE

    def wait_state(self) -> State:
        return self.get_state()

    def get_num_survivors(self) -> int:
        return self._number_of_survivors

    def get_total_saved_survivors(self) -> int:
        return self._number_of_survivors_saved_alive + self._number_of_survivors_saved_dead

    def get_agents(self) -> list[Agent]:
        return self._agents

    def get_protobuf_world_data(self) -> Dict[str, Any]:
        """Get world data in a format ready for protobuf serialization."""
        if self._world is None:
            raise Exception(
                "Aegis  : World is not initialized! Cannot send world object to client!"
            )

        cells = []
        agents = []
        survivors = []

        agent_map = {
            (agent.get_agent_id().id, agent.get_agent_id().gid): agent for agent in self._agents
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
                    "agent_ids": [{"id": aid.id, "gid": aid.gid} for aid in cell.agent_id_list],
                    "has_survivors": cell.number_of_survivors() > 0,
                }

                # Add top layer if present
                top_layer = cell.get_top_layer()
                if top_layer is not None:
                    if isinstance(top_layer, Survivor):
                        cell_data["survivor"] = {
                            "id": top_layer.id,
                            "state": (
                                0 if top_layer.get_energy_level() > 0 else 1
                            ),  # 0=alive, 1=dead
                        }
                        survivors.append(
                            {
                                "id": top_layer.id,
                                "state": 0 if top_layer.get_energy_level() > 0 else 1,
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
