from __future__ import annotations

from typing import cast, override

from _aegis.common.world.objects.world_object import WorldObject
from _aegis.parsers.helper.world_file_type import StackContent


class Survivor(WorldObject):
    def __init__(
        self,
        id: int = -1,
        health: int = 1,
    ) -> None:
        super().__init__()
        self._state: Survivor.State = self.State.ALIVE
        self.id: int = id
        self.set_health(health)

    def get_health(self) -> int:
        return self._health

    def set_health(self, health: int) -> None:
        self._health: int = health
        if health <= 0:
            self.set_dead()
        else:
            self.set_alive()

    def remove_health(self, remove_energy: int) -> None:
        if remove_energy < self._health:
            self._health -= remove_energy
        else:
            self._health = 0
            self.set_dead()

    @override
    def __str__(self) -> str:
        return f"SURVIVOR ( ID {self.id} , HP {self._health} )"

    @override
    def __repr__(self) -> str:
        return self.__str__()

    @override
    def get_name(self) -> str:
        return "Survivor"

    @override
    def file_output_string(self) -> str:
        return f"SV({self._health})"

    @override
    def string_information(self) -> list[str]:
        string_information = super().string_information()
        string_information.append(f"Health = {self._health}")
        return string_information

    @override
    def clone(self) -> Survivor:
        survivor = cast(Survivor, super().clone())
        survivor._health = self._health
        return survivor

    @override
    def json(self) -> StackContent:
        return {
            "type": "sv",
            "arguments": {
                "energy_level": self._health,
            },
        }
