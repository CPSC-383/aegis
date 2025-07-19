import random
import sys
from enum import Enum


class CellType(Enum):
    """Enum representing different types of cells."""

    NO_CELL = 1
    NORMAL_CELL = 2
    CHARGING_CELL = 3
    KILLER_CELL = 4
    SPAWN_CELL = 5


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
