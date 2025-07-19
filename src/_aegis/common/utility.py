import random
import sys
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


class Utility:
    random.seed(12345)

    @staticmethod
    def random_in_range(low: int, high: int) -> int:
        return low + random.randint(0, high - low)

    @staticmethod
    def set_random_seed(seed: int) -> None:
        random.seed(seed)

    @staticmethod
    def next_int() -> int:
        return abs(random.randint(0, sys.maxsize))

    @staticmethod
    def next_boolean() -> bool:
        return random.choice([True, False])
