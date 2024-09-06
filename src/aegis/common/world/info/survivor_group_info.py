from typing import override

from aegis.common.utility import Utility
from aegis.common.world.info.world_object_info import WorldObjectInfo


class SurvivorGroupInfo(WorldObjectInfo):
    """
    Represents the information of a survivor group in the world.

    Attributes:
        id (int): The id of the survivor group.
        number_of_survivors (int): The number of survivors in the group.
        energy_level (int): The energy level of the survivor group.
    """

    def __init__(self, id: int, energy_level: int, number_of_survivors: int) -> None:
        """
        Initializes a SurvivorGroupInfo instance.

        Args:
            energy_level: The energy level of the survivor group.
            number_of_survivors: The number of survivors in the group.
        """
        super().__init__(id)
        self.energy_level = energy_level
        self.number_of_survivors = number_of_survivors

    @override
    def distort_info(self, factor: int) -> None:
        distortion = Utility.random_in_range(1, factor)
        if Utility.next_boolean():
            if distortion > self.energy_level:
                self.energy_level = 0
            else:
                self.energy_level -= distortion
        else:
            self.energy_level += distortion

    @override
    def __str__(self) -> str:
        return f"SURVIVOR_GROUP ( ID {self.id} , NUM_SV {self.number_of_survivors} , ENG_LV {self.energy_level} )"
