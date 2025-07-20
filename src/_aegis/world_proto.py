from .common import Cell
from .common.objects import Rubble, Survivor
from .schemas import world_pb2
from .schemas.cell_pb2 import CellType
from .schemas.world_object_pb2 import SurvivorState
from .world import World


def get_cell_type(cell: Cell) -> CellType:
    if cell.is_spawn_cell():
        return CellType.SPAWN
    if cell.is_charging_cell():
        return CellType.CHARGING
    if cell.is_killer_cell():
        return CellType.KILLER
    return CellType.NORMAL


def serialize_world(world: World) -> world_pb2.World:
    proto_world = world_pb2.World()
    proto_world.width = world.width
    proto_world.height = world.height
    proto_world.seed = world.seed
    proto_world.start_energy = world.start_energy
    proto_world.total_survivors = world.total_survivors

    for cell in world.cells:
        proto_cell = proto_world.cells.add()
        proto_cell.loc.x = cell.location.x
        proto_cell.loc.y = cell.location.y
        proto_cell.move_cost = cell.move_cost
        proto_cell.type = get_cell_type(cell)
        proto_cell.agents.extend(cell.agents)

        for layer in cell.get_layers():
            layer_proto = proto_cell.layers.add()
            if isinstance(layer, Survivor):
                survivor_proto = layer_proto.survivor
                survivor_proto.id = layer.id
                survivor_proto.health = layer.get_health()
                survivor_proto.state = (
                    SurvivorState.ALIVE
                    if layer.get_health() > 0
                    else SurvivorState.DEAD
                )
            elif isinstance(layer, Rubble):
                rubble_proto = layer_proto.rubble
                rubble_proto.id = layer.id
                rubble_proto.energy_required = layer.energy_required
                rubble_proto.agents_required = layer.agents_required

    return proto_world
