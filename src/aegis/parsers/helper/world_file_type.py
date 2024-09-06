from typing import Literal, TypedDict


class WorldSize(TypedDict):
    width: int
    height: int


class WorldFileLevels(TypedDict):
    high: int
    mid: int
    low: int


class WorldInfo(TypedDict):
    size: WorldSize
    seed: int
    world_file_levels: WorldFileLevels
    agent_energy: int


class Settings(TypedDict):
    world_info: WorldInfo


class SpawnInfo(TypedDict):
    x: int
    y: int
    gid: int | None


class AgentInfo(TypedDict):
    id: int
    gid: int
    x: int
    y: int


class GridLoc(TypedDict):
    x: int
    y: int


class GridTypes(TypedDict):
    fire_grids: list[GridLoc]
    killer_grids: list[GridLoc]
    charging_grids: list[GridLoc]


Arguments = Literal[
    "energy_level",
    "number_of_survivors",
    "remove_energy",
    "remove_agents",
    "damage_factor",
    "body_mass",
    "mental_state",
]


class StackContent(TypedDict):
    type: str
    arguments: dict[Arguments, int]


class StackInfo(TypedDict):
    grid_loc: GridLoc
    move_cost: int
    contents: list[StackContent]


class WorldFileType(TypedDict):
    settings: Settings
    spawn_locs: list[SpawnInfo]
    agent_place: list[AgentInfo]
    grid_types: GridTypes
    stacks: list[StackInfo]
