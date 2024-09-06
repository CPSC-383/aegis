import json
from typing import cast

from aegis.common import AgentID, Location
from aegis.parsers.aegis_world_file import AegisWorldFile
from aegis.parsers.helper.world_file_type import SpawnInfo
from aegis.parsers.helper.grid_info_settings import GridInfoSettings
from aegis.parsers.helper.grid_type_info import GridTypeInfo
from aegis.parsers.helper.world_file_type import (
    AgentInfo,
    GridLoc,
    GridTypes,
    StackInfo,
    WorldFileType,
)


class WorldFileParser:
    @staticmethod
    def parse_world_file(filename: str) -> AegisWorldFile | None:
        try:
            with open(filename, "r") as file:
                data: WorldFileType = json.load(file)
                width = data["settings"]["world_info"]["size"]["width"]
                height = data["settings"]["world_info"]["size"]["height"]
                agent_energy = data["settings"]["world_info"]["agent_energy"]
                seed = data["settings"]["world_info"]["seed"]
                high_survivor_level = data["settings"]["world_info"][
                    "world_file_levels"
                ]["high"]

                mid_survivor_level = data["settings"]["world_info"][
                    "world_file_levels"
                ]["mid"]
                low_survivor_level = data["settings"]["world_info"][
                    "world_file_levels"
                ]["low"]

                grid_settings = WorldFileParser._parse_grid_settings(data["grid_types"])
                grid_stack_info = WorldFileParser._parse_grid_stack_info(data["stacks"])
                agent_spawn_locations = WorldFileParser._parse_spawn_locations(
                    data["spawn_locs"]
                )
                return AegisWorldFile(
                    width,
                    height,
                    agent_energy,
                    seed,
                    high_survivor_level,
                    mid_survivor_level,
                    low_survivor_level,
                    grid_stack_info,
                    grid_settings,
                    agent_spawn_locations,
                )
        except Exception as e:
            print(f"Error: {e}")
            return None

    @staticmethod
    def _parse_grid_stack_info(
        grid_stack_info: list[StackInfo],
    ) -> list[GridInfoSettings]:
        return [
            GridInfoSettings(
                grid["move_cost"],
                grid["contents"],
                Location(grid["grid_loc"]["x"], grid["grid_loc"]["y"]),
            )
            for grid in grid_stack_info
        ]

    @staticmethod
    def _parse_grid_settings(grid_types: GridTypes) -> list[GridTypeInfo]:
        return [
            GridTypeInfo(
                name,
                [
                    Location(loc["x"], loc["y"])
                    for loc in cast(list[GridLoc], grid_locs)
                ],
            )
            for name, grid_locs in grid_types.items()
        ]

    @staticmethod
    def _parse_agents(agents: list[AgentInfo]) -> dict[AgentID, Location]:
        return {
            AgentID(agent_info["id"], agent_info["gid"]): Location(
                agent_info["x"], agent_info["y"]
            )
            for agent_info in agents
        }

    @staticmethod
    def _parse_spawn_locations(
        spawn_locs: list[SpawnInfo],
    ) -> dict[tuple[Location, int | None], int]:
        spawn_counts: dict[tuple[Location, int | None], int] = {}

        for loc in spawn_locs:
            location = Location(loc["x"], loc["y"])
            gid = loc.get("gid")
            key = (location, gid)
            if key not in spawn_counts:
                spawn_counts[key] = 0
            spawn_counts[key] += 1

        return spawn_counts
