from typing import override

from aegis.common import Utility
from aegis.common.world.info.world_object_info import WorldObjectInfo


class RubbleInfo(WorldObjectInfo):
    """
    Represents the information of rubble in the world.

    Attributes:
        id (int): The id of the rubble.
        remove_energy (int): The amount of energy to remove the rubble.
        remove_agents (int): The amount of agents to remove the rubble.
    """

    def __init__(self, id: int, remove_energy: int, remove_agents: int) -> None:
        """
        Initializes a RubbleInfo instance.

        Args:
            id: The id of the rubble.
            remove_energy: The amount of energy to remove the rubble.
            remove_agents: The amount of agents to remove the rubble.
        """
        super().__init__(id)
        self.remove_energy = remove_energy
        self.remove_agents = remove_agents

    @override
    def distort_info(self, factor: int) -> None:
        distortion = Utility.random_in_range(1, factor)
        if Utility.next_boolean():
            # Distortion decreases the values
            if distortion > self.remove_agents:
                self.remove_agents = 0
            else:
                self.remove_agents -= distortion

            if distortion > self.remove_energy:
                self.remove_energy = 0
            else:
                self.remove_energy -= distortion
        else:
            # Distortion increases the values
            self.remove_agents += distortion
            self.remove_energy += distortion

    @override
    def __str__(self) -> str:
        return (
            f"RUBBLE ( ID {self.id} , NUM_TO_RM {self.remove_agents} , "
            f"RM_ENG {self.remove_energy} )"
        )
