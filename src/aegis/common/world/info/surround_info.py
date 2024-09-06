from typing import override

from aegis.common import Direction, LifeSignals
from aegis.common.world.info.grid_info import GridInfo


class SurroundInfo:
    """
    Represents the information about the surrounding grid cells in the world.

    Attributes:
        life_signals (LifeSignals): The life signals in each surrounding grid.
    """

    def __init__(self) -> None:
        """Initializes a new instance of SurroundInfo."""
        self.life_signals = LifeSignals()
        self._surround_info = [[GridInfo() for _ in range(3)] for _ in range(3)]

    def get_current_info(self) -> GridInfo:
        """Returns the grid info for the current grid cell."""
        return self._surround_info[Direction.CENTER.dx][Direction.CENTER.dy]

    def set_current_info(self, current_info: GridInfo) -> None:
        """
        Sets the grid info for the current grid cell.

        Args:
            current_info: The grid info for the current cell.
        """
        self._surround_info[Direction.CENTER.dx][Direction.CENTER.dy] = current_info

    def get_surround_info(self, dir: Direction) -> GridInfo | None:
        """
        Returns the grid info for a specified direction.

        Args:
            dir: The direction for which to get the surrounding grid information.
        """
        return self._surround_info[dir.dx][dir.dy]

    def set_surround_info(self, dir: Direction, grid_info: GridInfo) -> None:
        """
        Sets the grid info for a specified direction.

        Args:
            dir: The direction for which to set the surrounding grid information.
            grid_info: The grid info to be set for the specified direction.
        """
        self._surround_info[dir.dx][dir.dy] = grid_info

    @override
    def __str__(self) -> str:
        return (
            f"CURR_GRID ( {self.get_current_info()} ) , NUM_SIG {self.life_signals.size()} , "
            f"LIFE_SIG {self.life_signals} , NORTH_WEST ( {self.get_surround_info(Direction.NORTH_WEST)} ) , "
            f"NORTH ( {self.get_surround_info(Direction.NORTH)} ) , "
            f"NORTH_EAST ( {self.get_surround_info(Direction.NORTH_EAST)} ) , "
            f"EAST ( {self.get_surround_info(Direction.EAST)} ) , "
            f"SOUTH_EAST ( {self.get_surround_info(Direction.SOUTH_EAST)} ) , "
            f"SOUTH ( {self.get_surround_info(Direction.SOUTH)} ) , "
            f"SOUTH_WEST ( {self.get_surround_info(Direction.SOUTH_WEST)} ) , "
            f"WEST ( {self.get_surround_info(Direction.WEST)} )"
        )
