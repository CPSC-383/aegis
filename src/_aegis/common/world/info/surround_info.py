from typing import override

from _aegis.common.direction import Direction
from _aegis.common.world.info.cell_info import CellInfo


class SurroundInfo:
    """
    Represents the information about the surrounding cells of the agent.
    """

    def __init__(self) -> None:
        """Initializes a new instance of SurroundInfo."""
        self._surround_info: list[list[CellInfo]] = [
            [CellInfo() for _ in range(3)] for _ in range(3)
        ]

    def get_current_info(self) -> CellInfo:
        """Returns the cell info for the current cell."""
        return self._surround_info[Direction.CENTER.dx][Direction.CENTER.dy]

    def set_current_info(self, current_info: CellInfo) -> None:
        """
        Sets the cell info for the current cell.

        Args:
            current_info: The cell info for the current cell.
        """
        self._surround_info[Direction.CENTER.dx][Direction.CENTER.dy] = current_info

    def get_surround_info(self, dir: Direction) -> CellInfo | None:
        """
        Returns the cell info for a specified direction.

        Args:
            dir: The direction for which to get the surrounding cell information.
        """
        return self._surround_info[dir.dx][dir.dy]

    def set_surround_info(self, dir: Direction, cell_info: CellInfo) -> None:
        """
        Sets the cell info for a specified direction.

        Args:
            dir: The direction for which to set the surrounding cell information.
            cell_info: The cell info to be set for the specified direction.
        """
        self._surround_info[dir.dx][dir.dy] = cell_info

    @override
    def __str__(self) -> str:
        return (
            f"CURR_CELL ( {self.get_current_info()} ) , "
            f"NORTH_WEST ( {self.get_surround_info(Direction.NORTH_WEST)} ) , "
            f"NORTH ( {self.get_surround_info(Direction.NORTH)} ) , "
            f"NORTH_EAST ( {self.get_surround_info(Direction.NORTH_EAST)} ) , "
            f"EAST ( {self.get_surround_info(Direction.EAST)} ) , "
            f"SOUTH_EAST ( {self.get_surround_info(Direction.SOUTH_EAST)} ) , "
            f"SOUTH ( {self.get_surround_info(Direction.SOUTH)} ) , "
            f"SOUTH_WEST ( {self.get_surround_info(Direction.SOUTH_WEST)} ) , "
            f"WEST ( {self.get_surround_info(Direction.WEST)} )"
        )
