from typing import override

from aegis.common.utility import Utility
from aegis.common.world.info.world_object_info import WorldObjectInfo


class SurvivorInfo(WorldObjectInfo):
    """
    Represents the information of a survivor in the world.

    Attributes:
        id (int): The id of the survivor.
        damage_factor (int): The damage factor of the survivor.
        body_mass (int): The body mass of the survivor.
        mental_state (int): The mental state of the survivor.
        energy_level (int): The energy_level of the survivor.
    """

    def __init__(
        self,
        id: int,
        energy_level: int,
        damage_factor: int,
        body_mass: int,
        mental_state: int,
    ) -> None:
        """
        Initializes a SurvivorInfo instance.

        Args:
            id: The id of the survivor.
            energy_level: The energy_level of the survivor.
            damage_factor: The damage factor of the survivor.
            body_mass: The body mass of the survivor.
            mental_state: The mental state of the survivor.
        """
        super().__init__(id)
        self.energy_level = energy_level
        self.damage_factor = damage_factor
        self.body_mass = body_mass
        self.mental_state = mental_state

    @override
    def distort_info(self, factor: int) -> None:
        distortion = Utility.random_in_range(1, factor)
        if Utility.next_boolean():
            self.energy_level += distortion
            self.damage_factor += distortion
            self.body_mass += distortion
            self.mental_state += distortion
        else:
            if distortion > self.energy_level:
                self.energy_level = 0
            else:
                self.energy_level -= distortion

            if distortion > self.damage_factor:
                self.damage_factor = 0
            else:
                self.damage_factor -= distortion

            if distortion > self.body_mass:
                self.body_mass = 0
            else:
                self.body_mass -= distortion

            if distortion > self.mental_state:
                self.mental_state = 0
            else:
                self.mental_state -= distortion

    @override
    def __str__(self) -> str:
        return f"SURVIVOR ( ID {self.id} , ENG_LEV {self.energy_level} , DMG_FAC {self.damage_factor} , BDM {self.body_mass} , MS {self.mental_state} )"
