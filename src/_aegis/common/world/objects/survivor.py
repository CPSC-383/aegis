from __future__ import annotations

from enum import Enum
from typing import TYPE_CHECKING, override

from _aegis.common.world.objects.world_object import WorldObject

if TYPE_CHECKING:
    from _aegis.parsers.helper.world_file_type import Layer


class Survivor(WorldObject):
    def __init__(self, survivor_id: int = -1, health: int = 1) -> None:
        super().__init__()
        self._state: Survivor.State = self.State.ALIVE
        self.id: int = survivor_id
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

    def is_alive(self) -> bool:
        return self._state == self.State.ALIVE

    def is_dead(self) -> bool:
        return self._state == self.State.DEAD

    def set_alive(self) -> None:
        self._state = self.State.ALIVE

    def set_dead(self) -> None:
        self._state = self.State.DEAD

    @override
    def __str__(self) -> str:
        return f"SURVIVOR ( ID {self.id} , HP {self._health} )"

    @override
    def __repr__(self) -> str:
        return self.__str__()

    @override
    def json(self) -> Layer:
        return {
            "type": "sv",
            "attributes": {
                "energy_level": self._health,
            },
        }

    class State(Enum):
        ALIVE = 1
        DEAD = 2
