from typing import override

from _aegis.common.commands.aegis_command import AegisCommand
from _aegis.common.world.info import SurroundInfo


class WorldUpdate(AegisCommand):
    def __init__(
        self,
        energy_level: int,
        surround_info: SurroundInfo,
    ) -> None:
        self.energy_level: int = energy_level
        self.surround_info: SurroundInfo = surround_info

    @override
    def __str__(self) -> str:
        return (
            f"{self.STR_WORLD_UPDATE} ( ENG_LEV {self.energy_level} , "
            f"SUR_INFO {self.surround_info} )"
        )

    @override
    def __repr__(self) -> str:
        return self.__str__()
