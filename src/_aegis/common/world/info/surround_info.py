from typing import override

from _aegis.common.direction import Direction
from _aegis.common.world.info.cell_info import CellInfo


class SurroundInfo:
    def __init__(self) -> None:
        self._surround_info: list[list[CellInfo]] = [
            [CellInfo() for _ in range(3)] for _ in range(3)
        ]

    def get_current_info(self) -> CellInfo:
        return self._surround_info[Direction.CENTER.dx][Direction.CENTER.dy]

    def set_current_info(self, current_info: CellInfo) -> None:
        self._surround_info[Direction.CENTER.dx][Direction.CENTER.dy] = current_info

    def get_surround_info(self, d: Direction) -> CellInfo | None:
        return self._surround_info[d.dx][d.dy]

    def set_surround_info(self, d: Direction, cell_info: CellInfo) -> None:
        self._surround_info[d.dx][d.dy] = cell_info

    @override
    def __str__(self) -> str:
        return (
            f"CURR_CELL ( {self.get_current_info()} ) , "
            f"NORTHWEST ( {self.get_surround_info(Direction.NORTHWEST)} ) , "
            f"NORTH ( {self.get_surround_info(Direction.NORTH)} ) , "
            f"NORTHEAST ( {self.get_surround_info(Direction.NORTHEAST)} ) , "
            f"EAST ( {self.get_surround_info(Direction.EAST)} ) , "
            f"SOUTHEAST ( {self.get_surround_info(Direction.SOUTHEAST)} ) , "
            f"SOUTH ( {self.get_surround_info(Direction.SOUTH)} ) , "
            f"SOUTHWEST ( {self.get_surround_info(Direction.SOUTHWEST)} ) , "
            f"WEST ( {self.get_surround_info(Direction.WEST)} )"
        )
