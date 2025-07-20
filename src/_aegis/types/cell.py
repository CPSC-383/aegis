from enum import Enum
from typing import override


class CellType(Enum):
    """Enum representing different types of cells."""

    NORMAL_CELL = 0
    CHARGING_CELL = 1
    KILLER_CELL = 2
    SPAWN_CELL = 3

    @override
    def __str__(self) -> str:
        name = self.name.lower().replace("_cell", "")
        return name.capitalize()

    @override
    def __repr__(self) -> str:
        return self.__str__()
