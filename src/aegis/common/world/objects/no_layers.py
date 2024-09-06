from __future__ import annotations

from typing import cast, override

from aegis.common.world.info import NoLayersInfo, WorldObjectInfo
from aegis.common.world.objects.world_object import WorldObject
from aegis.parsers.helper.world_file_type import StackContent


class NoLayers(WorldObject):
    """Represents no more layers in a grid."""

    def __init__(self) -> None:
        super().__init__()

    @override
    def __str__(self) -> str:
        return "NO_LAYERS"

    @override
    def get_name(self) -> str:
        return "No Layers"

    @override
    def get_life_signal(self) -> int:
        return 0

    @override
    def get_object_info(self) -> WorldObjectInfo:
        return NoLayersInfo()

    @override
    def file_output_string(self) -> str:
        return ""

    @override
    def json(self) -> StackContent:
        return {
            "type": "nl",
            "arguments": {},
        }

    @override
    def string_information(self) -> list[str]:
        return super().string_information()

    @override
    def clone(self) -> NoLayers:
        return cast(NoLayers, super().clone())
