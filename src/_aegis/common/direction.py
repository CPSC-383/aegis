from __future__ import annotations

from enum import Enum
from typing import override


class Direction(Enum):
    """
    Represents the eight principal compass directions plus the center (no movement).

    Each direction has a tuple value representing its (dx, dy) movement on a grid.
    """

    NORTH = (0, 1)
    """North - moves upward along the y-axis."""

    NORTHEAST = (1, 1)
    """Northeast - moves diagonally up and right."""

    EAST = (1, 0)
    """East - moves right along the x-axis."""

    SOUTHEAST = (1, -1)
    """Southeast - moves diagonally down and right."""

    SOUTH = (0, -1)
    """South - moves downward along the y-axis."""

    SOUTHWEST = (-1, -1)
    """Southwest - moves diagonally down and left."""

    WEST = (-1, 0)
    """West - moves left along the x-axis."""

    NORTHWEST = (-1, 1)
    """Northwest - moves diagonally up and left."""

    CENTER = (0, 0)
    """Center - no movement."""

    @property
    def dx(self) -> int:
        """Get the change in the x direction."""
        return self.value[0]

    @property
    def dy(self) -> int:
        """Get the change in the y direction."""
        return self.value[1]

    def rotate_left(self) -> Direction:
        """
        Rotate the direction 45 degrees counter-clockwise (left).

        The center direction returns itself unchanged.

        Returns:
            Direction: The direction rotated left.

        """
        if self == Direction.CENTER:
            return self
        new_index = (dir_to_index[self] - 1) % 8
        return dir_order[new_index]

    def rotate_right(self) -> Direction:
        """
        Rotate the direction 45 degrees clockwise (right).

        The center direction returns itself unchanged.

        Returns:
            Direction: The direction rotated right.

        """
        if self == Direction.CENTER:
            return self
        new_index = (dir_to_index[self] + 1) % 8
        return dir_order[new_index]

    def get_opposite(self) -> Direction:
        """
        Get the opposite direction (180 degrees rotation).

        The center direction returns itself unchanged.

        Returns:
            Direction: The opposite direction.

        """
        if self == Direction.CENTER:
            return self
        new_index = (dir_to_index[self] + 4) % 8
        return dir_order[new_index]

    @override
    def __str__(self) -> str:
        """
        Return the string representation of the direction (its name).

        Returns:
            str: The name of the direction.

        """
        return self.name

    @override
    def __repr__(self) -> str:
        """
        Return the repr string of the direction (same as str).

        Returns:
            str: The name of the direction.

        """
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
