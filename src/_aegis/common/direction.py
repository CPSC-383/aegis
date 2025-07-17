from __future__ import annotations

from enum import Enum
from typing import override


class Direction(Enum):
    NORTH = (0, 1)
    NORTHEAST = (1, 1)
    EAST = (1, 0)
    SOUTHEAST = (1, -1)
    SOUTH = (0, -1)
    SOUTHWEST = (-1, -1)
    WEST = (-1, 0)
    NORTHWEST = (-1, 1)
    CENTER = (0, 0)

    @property
    def dx(self) -> int:
        return self.value[0]

    @property
    def dy(self) -> int:
        return self.value[1]

    def rotate_left(self) -> Direction:
        if self == Direction.CENTER:
            return self
        new_index = (dir_to_index[self] - 1) % 8
        return dir_order[new_index]

    def rotate_right(self) -> Direction:
        if self == Direction.CENTER:
            return self
        new_index = (dir_to_index[self] + 1) % 8
        return dir_order[new_index]

    def get_opposite(self) -> Direction:
        if self == Direction.CENTER:
            return self
        new_index = (dir_to_index[self] + 4) % 8
        return dir_order[new_index]

    @override
    def __str__(self) -> str:
        return self.name

    @override
    def __repr__(self) -> str:
        return self.__str__()


dir_order = [
    Direction.NORTH,
    Direction.NORTHEAST,
    Direction.EAST,
    Direction.SOUTHEAST,
    Direction.SOUTH,
    Direction.SOUTHWEST,
    Direction.WEST,
    Direction.NORTHWEST,
    Direction.CENTER,
]
dir_to_index = {d: i for i, d in enumerate(dir_order)}
