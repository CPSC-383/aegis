from typing import override

from _aegis.types.cell import CellType

from .location import Location
from .objects import WorldObject


class CellInfo:
    def __init__(
        self,
        cell_type: CellType = CellType.NORMAL_CELL,
        location: Location | None = None,
        move_cost: int = 0,
        agents: list[int] | None = None,
        top_layer: WorldObject | None = None,
    ) -> None:
        self.type: CellType = cell_type
        self.location: Location = location if location is not None else Location(-1, -1)
        self.move_cost: int = move_cost
        self.agents: list[int] = agents if agents is not None else []
        self.top_layer: WorldObject | None = (
            top_layer if top_layer is not None else None
        )

    def is_killer_cell(self) -> bool:
        return self.type == CellType.KILLER_CELL

    @override
    def __str__(self) -> str:
        return (
            f"{self.type.name} (\n"
            f"  X: {self.location.x},\n"
            f"  Y: {self.location.y},\n"
            f"  Move Cost: {self.move_cost},\n"
            f"  Num Agents: {len(self.agents)},\n"
            f"  Agent IDs: {self.agents},\n"
            f"  Top Layer: {self.top_layer}\n"
            f")"
        )

    @override
    def __repr__(self) -> str:
        return self.__str__()