from pathlib import Path

from google.protobuf.message import DecodeError

from .aegis_config import is_feature_enabled
from .common import Cell, Location
from .common.objects import Rubble, Survivor, WorldObject
from .logger import LOGGER
from .types.world import Attributes, CellInfoRaw, WorldInfo
from .world import World
from .world_proto import deserialize_world


def load_world(filename: Path) -> World | None:
    try:
        with filename.open("rb") as file:
            data = file.read()
        return deserialize_world(data)

    except (FileNotFoundError, DecodeError):
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
