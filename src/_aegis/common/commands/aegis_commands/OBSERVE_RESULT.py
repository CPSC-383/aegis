from typing import override

from _aegis.common.commands.aegis_command import AegisCommand
from _aegis.common.world.info import CellInfo
from _aegis.common.world.objects.world_object import WorldObject


class OBSERVE_RESULT(AegisCommand):
    """
    Represents the result of observing a cell.

    Attributes:
        energy_level (int): The energy_level of the agent.
        cell_info (CellInfo): The information of the cell that was observed.
        layers (list[WorldObject]): The layers of the cell.
    """

    def __init__(
        self, energy_level: int, cell_info: CellInfo, layers: list[WorldObject]
    ) -> None:
        """
        Initializes an OBSERVE_RESULT instance.

        Args:
            energy_level: The energy_level of the agent.
            cell_info: The information of the cell that was observed.
            layers: The layers of the cell.
        """
        self.energy_level: int = energy_level
        self.cell_info: CellInfo = cell_info
        self.layers: list[WorldObject] = layers

    @override
    def __str__(self) -> str:
        return f"{self.STR_OBSERVE_RESULT} ( ENG_LEV {self.energy_level} , CELL_INFO ( {self.cell_info} ) , LAYERS {self.layers} )"

    @override
    def __repr__(self) -> str:
        return self.__str__()
