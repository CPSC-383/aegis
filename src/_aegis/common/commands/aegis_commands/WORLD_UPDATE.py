from typing import override

from _aegis.common.commands.aegis_command import AegisCommand
from _aegis.common.world.info import SurroundInfo


class WORLD_UPDATE(AegisCommand):
    """
    Represents the result of saving a survivor.

    Attributes:
        energy_level (int): The energy level of the agent.
        surround_info (SurroundInfo): The surrounding info of the agent.
    """

    def __init__(
        self,
        energy_level: int,
        surround_info: SurroundInfo,
    ) -> None:
        """
        Initializes a WORLD_UPDATE instance.

        Args:
            energy_level: The energy level of the agent.
            surround_info: The surrounding info of the agent.
        """
        self.energy_level: int = energy_level
        self.surround_info: SurroundInfo = surround_info

    @override
    def __str__(self) -> str:
        return f"{self.STR_WORLD_UPDATE} ( ENG_LEV {self.energy_level} , SUR_INFO {self.surround_info} )"

    @override
    def __repr__(self) -> str:
        return self.__str__()
