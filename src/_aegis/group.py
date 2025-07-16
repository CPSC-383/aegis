from dataclasses import dataclass, field
from typing import override


@dataclass(eq=False)
class AgentGroup:
    GID: int
    name: str
    id_counter: int = field(default=1)
    number_saved_alive: int = field(default=0)
    number_saved_dead: int = field(default=0)
    number_saved: int = field(default=0)
    number_predicted_right: int = field(default=0)
    number_predicted_wrong: int = field(default=0)
    number_predicted: int = field(default=0)
    score: int = field(default=0)

    @override
    def __eq__(self, other: object) -> bool:
        if isinstance(other, AgentGroup):
            return self.GID == other.GID
        return False

    @override
    def __hash__(self) -> int:
        hash = 7
        hash = 67 * hash + self.GID
        return hash
