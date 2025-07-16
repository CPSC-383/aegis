from typing import override

from _aegis.common.world.objects import Survivor, WorldObject
from _aegis.parsers.helper.world_file_type import Arguments
from .object_handler import ObjectHandler


class SurvivorHandler(ObjectHandler):
    def __init__(self) -> None:
        super().__init__()
        self.sv_map: dict[int, Survivor] = {}
        self.alive: int = 0
        self.dead: int = 0

    @override
    def get_keys(self) -> list[str]:
        return ["SV", "Survivor"]

    @override
    def create_world_object(self, params: dict[Arguments, int]) -> WorldObject | None:
        if len(params) < 1:
            print(
                "WARNING: SurvivorHandler: incorrect Parameter setting: missing energy_level"
            )
            return None

        energy_level = params["energy_level"]

        survivor = Survivor(
            self.world_object_count,
            energy_level,
        )

        self.sv_map[self.world_object_count] = survivor
        self.world_object_count += 1
        if survivor.get_health() > 0:
            self.alive += 1
        else:
            self.dead += 1
        return survivor

    @override
    def reset(self) -> None:
        self.sv_map.clear()
        self.alive = 0
        self.dead = 0
