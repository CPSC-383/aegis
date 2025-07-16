from typing import override

from _aegis.common.world.objects import Rubble, WorldObject
from _aegis.parsers.helper.world_file_type import Arguments
from .object_handler import ObjectHandler


class RubbleHandler(ObjectHandler):
    def __init__(self) -> None:
        super().__init__()
        self.rb_map: dict[int, Rubble] = {}

    @override
    def get_keys(self) -> list[str]:
        return ["RB", "RUBBLE"]

    @override
    def create_world_object(self, params: dict[Arguments, int]) -> WorldObject | None:
        if len(params) < 2:
            print(
                "WARNING: RubbleHandler: incorrect Parameter setting: missing energy_required and/or agents_required"
            )
            return None

        energy_required = params["energy_required"]
        agents_required = params["agents_required"]
        rubble = Rubble(self.world_object_count, energy_required, agents_required)
        self.rb_map[self.world_object_count] = rubble
        self.world_object_count += 1
        return rubble

    @override
    def reset(self) -> None:
        self.rb_map.clear()
