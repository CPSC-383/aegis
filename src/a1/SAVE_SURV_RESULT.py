from typing import override

from aegis.common.commands.aegis_command import AegisCommand
from aegis.common.world.info import SurroundInfo


class SAVE_SURV_RESULT(AegisCommand):
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
        Initializes a SAVE_SURV_RESULT instance.

        Args:
            energy_level: The energy level of the agent.
            surround_info: The surrounding info of the agent.
        """
        self.energy_level: int = energy_level
        self.surround_info: SurroundInfo = surround_info

    @override
    def __str__(self) -> str:
        return f"{self.STR_SAVE_SURV_RESULT} ( ENG_LEV {self.energy_level} , SUR_INFO {self.surround_info} )"
