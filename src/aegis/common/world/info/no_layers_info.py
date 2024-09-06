from typing import override

from aegis.common.world.info.world_object_info import WorldObjectInfo


class NoLayersInfo(WorldObjectInfo):
    """Represents the no layer info."""

    def __init__(self) -> None:
        super().__init__(-1)

    @override
    def distort_info(self, factor: int) -> None:
        pass

    @override
    def __str__(self) -> str:
        return "NO_LAYERS"
