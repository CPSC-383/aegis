from __future__ import annotations

import random
from enum import Enum
from typing import override


class Direction(Enum):
    NORTH = (0, 1)
    NORTH_EAST = (1, 1)
    EAST = (1, 0)
    SOUTH_EAST = (1, -1)
    SOUTH = (0, -1)
    SOUTH_WEST = (-1, -1)
    WEST = (-1, 0)
    NORTH_WEST = (-1, 1)
    CENTER = (0, 0)

    def __init__(
        self,
        dx: int,
        dy: int,
    ) -> None:
        self.dx = dx
        self.dy = dy

    @classmethod
    def get_direction_order(cls) -> list[Direction]:
        """
        Get the order of directions for arithmetic operations (excluding CENTER).
        """
        return [
            cls.NORTH,
            cls.NORTH_EAST,
            cls.EAST,
            cls.SOUTH_EAST,
            cls.SOUTH,
            cls.SOUTH_WEST,
            cls.WEST,
            cls.NORTH_WEST,
        ]

    def get_direction_order_num(self) -> int:
        """
        Get the position of this direction in the direction order list.
        Returns -1 for CENTER.
        """
        try:
            return self.get_direction_order().index(self)
        except ValueError:
            return -1  # CENTER is not in direction order

    def rotate_left(self) -> Direction:
        """
        Rotate the direction 45 degrees left/counter-clockwise.
        """
        if self == Direction.CENTER:
            return self
        new_index = (self.get_direction_order_num() - 1) % 8
        return self.get_direction_order()[new_index]

    def rotate_right(self) -> Direction:
        """
        Rotate the direction 45 degrees right/clockwise.
        """
        if self == Direction.CENTER:
            return self
        new_index = (self.get_direction_order_num() + 1) % 8
        return self.get_direction_order()[new_index]

    def get_opposite(self) -> Direction:
        """
        Get the opposite direction (180 degrees rotation).
        """
        if self == Direction.CENTER:
            return self
        new_index = (self.get_direction_order_num() + 4) % 8
        return self.get_direction_order()[new_index]

    def is_cardinal(self) -> bool:
        """
        Check if the direction is a cardinal direction (N, S, E, W).
        """
        return self in [Direction.NORTH, Direction.SOUTH, Direction.EAST, Direction.WEST]

    def is_diagonal(self) -> bool:
        """
        Check if the direction is a diagonal direction (NW, NE, SE, SW).
        """
        return self in [
            Direction.NORTH_WEST,
            Direction.NORTH_EAST,
            Direction.SOUTH_EAST,
            Direction.SOUTH_WEST,
        ]

    @classmethod
    def get_cardinal_directions(cls) -> list[Direction]:
        """
        Get all cardinal directions.
        """
        return [Direction.NORTH, Direction.SOUTH, Direction.EAST, Direction.WEST]

    @staticmethod
    def get_diagonal_directions() -> list[Direction]:
        """
        Get all diagonal directions.
        """
        return [
            Direction.NORTH_WEST,
            Direction.NORTH_EAST,
            Direction.SOUTH_EAST,
            Direction.SOUTH_WEST,
        ]

    @staticmethod
    def get_movement_directions() -> list[Direction]:
        """
        Get all directions that represent movement (excludes CENTER).
        """
        return [d for d in Direction if d != Direction.CENTER]

    @staticmethod
    def get_random_direction() -> Direction:
        return random.choice(list(Direction))

    def __getattribute__(self, name: str):
        """
        Prevent calling static methods on instances.
        """
        if name in [
            "get_cardinal_directions",
            "get_diagonal_directions",
            "get_movement_directions",
            "get_random_direction",
        ]:
            raise AttributeError(
                f"'{name}' is a static method and should be called on the class, not an instance. "
                f"Use Direction.{name}() instead of self.{name}()"
            )
        return super().__getattribute__(name)

    @override
    def __str__(self) -> str:
        return self.name

    @override
    def __repr__(self) -> str:
        return self.__str__()
