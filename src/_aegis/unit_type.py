from dataclasses import dataclass
from enum import Enum


@dataclass(frozen=True)
class Attributes:
    health: int
    action_cooldown: int


class UnitType(Enum):
    MEDIC = Attributes(50, 10)
    ENGINEER = Attributes(100, 10)
    COMMANDER = Attributes(75, 10)

    @property
    def health(self) -> int:
        return self.value.health

    @property
    def action_cooldown(self) -> int:
        return self.value.action_cooldown
