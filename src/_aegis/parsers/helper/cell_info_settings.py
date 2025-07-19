from dataclasses import dataclass, field
from typing import override

from _aegis.common import Location

from .world_file_type import Layer


@dataclass
class CellInfoSettings:
    move_cost: int
    layers: list[Layer]
    location: Location = field(default_factory=lambda: Location(-1, -1))

    @override
    def __str__(self) -> str:
        return f"Cell ({self.location}, Move_Cost {self.move_cost}) {self.layers}"
