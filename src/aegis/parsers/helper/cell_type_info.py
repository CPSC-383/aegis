from dataclasses import dataclass
from typing import override

from aegis.common.location import Location


@dataclass
class CellTypeInfo:
    name: str
    locs: list[Location]

    @override
    def __str__(self) -> str:
        values_str = ", ".join(str(loc) for loc in self.locs)
        return f"{self.name} {values_str}"
