from typing import override

from _aegis.common import CellInfo, Direction
from _aegis.common.commands.aegis_command import AegisCommand


class WorldUpdate(AegisCommand):
    def __init__(
        self,
        energy_level: int,
        surround: dict[Direction, CellInfo],
    ) -> None:
        self.energy_level: int = energy_level
        self.surround: dict[Direction, CellInfo] = surround

    @override
    def __str__(self) -> str:
        return (
            f"{self.STR_WORLD_UPDATE} ( ENG_LEV {self.energy_level} , "
            f"SUR_INFO {self.surround} )"
        )

    @override
    def __repr__(self) -> str:
        return self.__str__()
