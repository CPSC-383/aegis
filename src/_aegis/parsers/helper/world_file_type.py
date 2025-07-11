from typing import Literal, TypedDict

from _aegis.world.spawn_manager import SpawnZoneType


class WorldSize(TypedDict):
    width: int
    height: int


class WorldInfo(TypedDict):
    size: WorldSize
    seed: int
    agent_energy: int


class Settings(TypedDict):
    world_info: WorldInfo


class SpawnInfo(TypedDict):
    x: int
    y: int
    gid: int | None
    type: SpawnZoneType


class AgentInfo(TypedDict):
    id: int
    gid: int
    x: int
    y: int


class CellLoc(TypedDict):
    x: int
    y: int


class CellTypes(TypedDict):
    killer_cells: list[CellLoc]
    charging_cells: list[CellLoc]


Arguments = Literal[
    "energy_level",
    "number_of_survivors",
    "remove_energy",
    "remove_agents",
]


class StackContent(TypedDict):
    type: str
    arguments: dict[Arguments, int]


class StackInfo(TypedDict):
    cell_loc: CellLoc
    move_cost: int
    contents: list[StackContent]


class WorldFileType(TypedDict):
    settings: Settings
    spawn_locs: list[SpawnInfo]
    agent_place: list[AgentInfo]
    cell_types: CellTypes
    stacks: list[StackInfo]
