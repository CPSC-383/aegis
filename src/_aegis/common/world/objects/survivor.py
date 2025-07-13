from __future__ import annotations

from typing import cast, override

from _aegis.common.world.objects.world_object import WorldObject
from _aegis.parsers.helper.world_file_type import StackContent


class Survivor(WorldObject):
    """
    Represents a survivor layer in a cell.

    Attributes:
        id (int): The id of the survivor.
    """

    def __init__(
        self,
        id: int = -1,
        energy_level: int = 1,
    ) -> None:
        """
        Initializes a Survivor instance.

        Args:
            id: The id of the survivor.
            health: The energy_level of the survivor.
        """
        super().__init__()
        self._state: Survivor.State = self.State.ALIVE
        self.id: int = id
        self.set_energy_level(energy_level)

    def get_energy_level(self) -> int:
        return self._energy_level

    def set_energy_level(self, energy_level: int) -> None:
        self._energy_level: int = energy_level
        if energy_level <= 0:
            self.set_dead()
        else:
            self.set_alive()

    def remove_energy(self, remove_energy: int) -> None:
        if remove_energy < self._energy_level:
            self._energy_level -= remove_energy
        else:
            self._energy_level = 0
            self.set_dead()

    @override
    def __str__(self) -> str:
        return f"SURVIVOR ( ID {self.id} , ENG_LEV {self._energy_level} )"

    @override
    def __repr__(self) -> str:
        return self.__str__()

    @override
    def get_name(self) -> str:
        return "Survivor"

    @override
    def file_output_string(self) -> str:
        return f"SV({self._energy_level})"

    @override
    def string_information(self) -> list[str]:
        string_information = super().string_information()
        string_information.append(f"Energy Level = {self._energy_level}")
        return string_information

    @override
    def clone(self) -> Survivor:
        survivor = cast(Survivor, super().clone())
        survivor._energy_level = self._energy_level
        return survivor

    @override
    def json(self) -> StackContent:
        return {
            "type": "sv",
            "arguments": {
                "energy_level": self._energy_level,
            },
        }
