from pathlib import Path
from typing import cast

import yaml

from .aegis_config import is_feature_enabled
from .common import Cell, Location
from .common.objects import Rubble, Survivor, WorldObject
from .logger import LOGGER
from .types.world import Attributes, CellInfoRaw, WorldInfo, WorldRaw
from .world import World


def load_world(filename: Path) -> World | None:
    try:
        with Path.open(filename) as file:
            data = cast("WorldRaw", yaml.safe_load(file))

            width, height, start_energy, seed = _parse_info(data.get("world_info"))
            cells = _create_cells(data.get("cells"))

            return World(width, height, seed, start_energy, cells)
    except (FileNotFoundError, yaml.YAMLError, KeyError):
        return None


def _parse_info(world_info: WorldInfo) -> tuple[int, int, int, int]:
    size = world_info.get("size")
    return (
        size.get("width"),
        size.get("height"),
        world_info.get("start_energy"),
        world_info.get("seed"),
    )


def _create_cells(cells: list[CellInfoRaw]) -> list[Cell]:
    res: list[Cell] = []
    world_object_count = 0

    for cell_raw in cells:
        loc = cell_raw.get("loc")
        coord = (loc.get("x"), loc.get("y"))
        layers = cell_raw.get("layers")
        move_cost = cell_raw.get("move_cost")
        cell_type = cell_raw.get("type")

        cell = Cell(*coord)

        if cell_type is not None:
            if "move_cost" in cell_raw:
                error = f"Move cost should not be set at cell with coordinates {coord}."
                raise ValueError(error)
            cell.setup_cell(cell_type)
        else:
            if "move_cost" not in cell_raw:
                error = f"Cell at {coord} must have 'move_cost' if 'type' is not set."
                raise ValueError(error)
            cell.move_cost = move_cost

        for layer_raw in reversed(layers):
            layer = _create_world_object(
                world_object_count, layer_raw.get("type"), layer_raw.get("attributes")
            )
            if layer is not None:
                cell.add_layer(layer)
                world_object_count += 1

        res.append(cell)

    return res


def _create_world_object(
    obj_id: int, type_str: str, args: dict[Attributes, int]
) -> WorldObject | None:
    type_upper = type_str.upper()
    try:
        if type_upper == "SV":
            health = args["health"]
            return Survivor(obj_id, health)

        if type_upper == "RB":
            energy_required = args["energy_required"]
            agents_required = args["agents_required"]
            return Rubble(obj_id, energy_required, agents_required)
    except KeyError:
        LOGGER.exception("Missing attribute for object type '%s'", type_str)

    LOGGER.critical("Unknown or invalid object type: '%s'", type_str)
    return None


def load_agent_world(base_world: World) -> World:
    width, height = base_world.width, base_world.height
    seed = base_world.seed
    start_energy = base_world.start_energy

    cells: list[Cell] = []
    for x in range(width):
        for y in range(height):
            source_cell = base_world.get_cell_at(Location(x, y))
            cell = Cell(x, y)

            if source_cell.is_killer_cell():
                cell.set_killer_cell()
            elif source_cell.is_charging_cell():
                cell.set_charging_cell()
            elif source_cell.is_spawn_cell():
                cell.set_spawn_cell()

            if is_feature_enabled("ENABLE_MOVE_COST"):
                cell.move_cost = source_cell.move_cost

            cells.append(cell)

    return World(width, height, seed, start_energy, cells)
