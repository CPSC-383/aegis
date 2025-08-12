from dataclasses import dataclass
from enum import Enum


@dataclass(frozen=True)
class Attributes:
    health: int
    action_cooldown: int


class UnitType(Enum):
    NO_UNIT = Attributes(0, 10)
    """No unit type; used when the config `ALLOW_AGENT_TYPES` is disabled."""

    MEDIC = Attributes(50, 10)
    """Medic type."""
    ENGINEER = Attributes(100, 10)
    """Engineer type."""
    COMMANDER = Attributes(75, 10)
    """Commander type."""

    @property
    def health(self) -> int:
        """Health of the agent."""
        return self.value.health

    @property
    def action_cooldown(self) -> int:
        """Action cooldown of the agent."""
        return self.value.action_cooldown
