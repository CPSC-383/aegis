from __future__ import annotations

import random
from enum import Enum
from typing import override


class Direction(Enum):
    NORTH_WEST = (-1, 1)
    NORTH = (0, 1)
    NORTH_EAST = (1, 1)
    EAST = (1, 0)
    SOUTH_EAST = (1, -1)
    SOUTH = (0, -1)
    SOUTH_WEST = (-1, -1)
    WEST = (-1, 0)
    CENTER = (0, 0)

    def __init__(
        self,
        dx: int,
        dy: int,
    ) -> None:
        self.dx = dx
        self.dy = dy

    @staticmethod
    def get_random_direction() -> Direction:
        return random.choice(list(Direction))

    @override
    def __str__(self) -> str:
        return self.name

    @override
    def __repr__(self) -> str:
        return self.__str__()
