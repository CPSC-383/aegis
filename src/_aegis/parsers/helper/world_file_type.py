from typing import Literal, TypedDict


class WorldSize(TypedDict):
    width: int
    height: int


class WorldInfo(TypedDict):
    size: WorldSize
    seed: int
    start_energy: int


class Loc(TypedDict):
    x: int
    y: int


class CellTypes(TypedDict):
    spawns: list[Loc]
    killer: list[Loc]
    charging: list[Loc]


Attributes = Literal[
    "energy_level",
    "number_of_survivors",
    "energy_required",
    "agents_required",
]


class Layer(TypedDict):
    type: str
    attributes: dict[Attributes, int]


class CellInfo(TypedDict):
    loc: Loc
    move_cost: int
    layers: list[Layer]


class WorldFileType(TypedDict):
    world_info: WorldInfo
    special_cells: CellTypes
    cells: list[CellInfo]
