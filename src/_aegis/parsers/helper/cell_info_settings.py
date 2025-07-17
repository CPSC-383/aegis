from dataclasses import dataclass, field
from typing import override

from _aegis.common import Location

from .world_file_type import StackContent


@dataclass
class CellInfoSettings:
    move_cost: int
    contents: list[StackContent]
    location: Location = field(default_factory=lambda: Location(-1, -1))

    @override
    def __str__(self) -> str:
        return f"Cell ({self.location}, Move_Cost {self.move_cost}) {self.contents}"
