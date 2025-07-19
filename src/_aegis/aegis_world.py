import logging
from typing import Any

from _aegis.agent import Agent
from _aegis.common import (
    AgentID,
    Direction,
    Location,
)
from _aegis.common.world.cell import Cell
from _aegis.common.world.info import CellInfo, SurroundInfo
from _aegis.common.world.objects import Survivor
from _aegis.common.world.world import World

from .args_parser import Args
from .constants import Constants

LOGGER = logging.getLogger("aegis")


class AegisWorld:
    def __init__(self, agents: list[Agent], args: Args) -> None:
        self._world_object_count: int = 0
        self._agent_locations: dict[AgentID, Location] = {}
        self._random_seed: int = 0
        self._world: World | None = None
        self._agents: list[Agent] = agents
        self._args: Args = args
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

    def get_protobuf_world_data(self) -> dict[str, Any]:  # pyright: ignore[reportExplicitAny]
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
                        survivors.append(  # pyright: ignore[reportUnknownMemberType]
                            {
                                "id": top_layer.id,
                                "state": 0 if top_layer.get_health() > 0 else 1,
                            }
                        )
                    else:
                        # Assume it's rubble
                        cell_data["rubble"] = {"move_cost": cell_info.move_cost}

                cells.append(cell_data)  # pyright: ignore[reportUnknownMemberType]

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
                        agents.append(agent_data)  # pyright: ignore[reportUnknownMemberType]

        return {
            "width": self._world.width,
            "height": self._world.height,
            "cells": cells,
            "agents": agents,
            "survivors": survivors,
        }
