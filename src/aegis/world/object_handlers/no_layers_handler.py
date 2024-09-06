from typing import override

from aegis.common.world.objects import NoLayers, WorldObject
from aegis.parsers.helper.world_file_type import Arguments
from aegis.world.object_handlers.object_handler import ObjectHandler


class NoLayersHandler(ObjectHandler):
    def __init__(self) -> None:
        super().__init__()

    @override
    def get_keys(self) -> list[str]:
        return []

    @override
    def create_world_object(self, params: dict[Arguments, int]) -> WorldObject:
        return NoLayers()

    @override
    def reset(self) -> None:
        pass
