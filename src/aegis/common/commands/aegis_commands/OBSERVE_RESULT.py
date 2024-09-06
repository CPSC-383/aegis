from typing import override

from aegis.common import LifeSignals
from aegis.common.commands.aegis_command import AegisCommand
from aegis.common.world.info import GridInfo


class OBSERVE_RESULT(AegisCommand):
    """
    Represents the result of observing a grid.

    Attributes:
        energy_level (int): The energy_level of the agent.
        grid_info (GridInfo): The information of the grid that was observed.
        life_signals (LifeSignals): The life signals of the grid.
    """

    def __init__(
        self, energy_level: int, grid_info: GridInfo, life_signals: LifeSignals
    ) -> None:
        """
        Initializes an OBSERVE_RESULT instance.

        Args:
            energy_level: The energy_level of the agent.
            grid_info: The information of the grid that was observed.
            life_signals: The life signals of the grid.
        """
        self.energy_level = energy_level
        self.grid_info = grid_info
        self.life_signals = life_signals

    @override
    def __str__(self) -> str:
        return f"{self.STR_OBSERVE_RESULT} ( ENG_LEV {self.energy_level} , GRID_INFO ( {self.grid_info} ) , NUM_SIG {self.life_signals.size()} , LIFE_SIG {self.life_signals} )"

    def distort(self, factor: float) -> None:
        if factor <= 0:
            return
        self.life_signals.distort(int(factor))
        self.grid_info.distort_info(int(factor))
