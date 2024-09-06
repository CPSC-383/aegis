from dataclasses import dataclass
from typing import override
from aegis.common import Location
from aegis.parsers.helper.world_file_type import StackContent


@dataclass
class GridInfoSettings:
    move_cost: int
    contents: list[StackContent]
    location: Location = Location(-1, -1)

    @override
    def __str__(self) -> str:
        return f"Grid ({self.location}, Move_Cost {self.move_cost}) {self.contents}"
