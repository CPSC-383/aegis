from typing import override

from _aegis.common.location import Location
from _aegis.common.world.objects import WorldObject
from _aegis.types.cell import CellType


class CellInfo:
    def __init__(
        self,
        cell_type: CellType = CellType.NORMAL_CELL,
        location: Location | None = None,
        move_cost: int = 0,
        agents: list[int] | None = None,
        top_layer: WorldObject | None = None,
    ) -> None:
        self.cell_type: CellType = cell_type
        self.location: Location = location if location is not None else Location(-1, -1)
        self.move_cost: int = move_cost
        self.agents: list[int] = agents if agents is not None else []
        self.top_layer: WorldObject | None = (
            top_layer if top_layer is not None else None
        )

    @override
    def __str__(self) -> str:
        return (
            f"{self.cell_type.name} ( X {self.location.x} , Y {self.location.y} , "
            f"MV_COST {self.move_cost} , NUM_AGT {len(self.agents)} , "
            f"ID_LIST {self.agents} , TOP_LAYER ( {self.top_layer} ) )"
        )
