from dataclasses import dataclass

from aegis.common.location import Location
from aegis.parsers.helper.grid_info_settings import GridInfoSettings
from aegis.parsers.helper.grid_type_info import GridTypeInfo


@dataclass
class AegisWorldFile:
    width: int
    height: int
    initial_agent_energy: int
    random_seed: int
    high_survivor_level: int
    mid_survivor_level: int
    low_survivor_level: int
    grid_stack_info: list[GridInfoSettings]
    grid_settings: list[GridTypeInfo]
    agent_spawn_locations: dict[tuple[Location, int | None], int]
