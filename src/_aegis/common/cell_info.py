from typing import override

from _aegis.types import CellType

from .location import Location
from .objects import WorldObject


class CellInfo:
    def __init__(
        self,
        layers: list[WorldObject],
        cell_type: CellType = CellType.NORMAL_CELL,
        location: Location | None = None,
        move_cost: int = 0,
        agents: list[int] | None = None,
    ) -> None:
        self.type: CellType = cell_type
        self.location: Location = location if location is not None else Location(-1, -1)
        self.move_cost: int = move_cost
        self.agents: list[int] = agents if agents is not None else []
        self.layers: list[WorldObject] = layers

    @property
    def top_layer(self) -> WorldObject | None:
        return self.layers[0] if self.layers else None

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
