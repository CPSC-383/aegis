from __future__ import annotations

from typing import TYPE_CHECKING, override

from .world_object import WorldObject

if TYPE_CHECKING:
    from _aegis.types.world import Layer


class Rubble(WorldObject):
    def __init__(
        self, rubble_id: int = -1, energy_required: int = 1, agents_required: int = 1
    ) -> None:
        super().__init__()
        self.id: int = rubble_id
        self.energy_required: int = energy_required
        self.agents_required: int = agents_required

    @override
    def __str__(self) -> str:
        return (
            f"RUBBLE ( ID {self.id} , "
            f"NUM_TO_RM {self.agents_required} , "
            f"RM_ENG {self.energy_required} )"
        )

    @override
    def __repr__(self) -> str:
        return self.__str__()

    @override
    def json(self) -> Layer:
        return {
            "type": "rb",
            "attributes": {
                "energy_required": self.energy_required,
                "agents_required": self.agents_required,
            },
        }
