from __future__ import annotations

from typing import override

from _aegis.types.cell import CellType

from .cell_info import CellInfo
from .location import Location
from .objects import Survivor, WorldObject


class Cell:
    def __init__(self, x: int, y: int) -> None:
        self._type: CellType = CellType.NORMAL_CELL
        self._layers: list[WorldObject] = []
        self.move_cost: int = 1
        self.agents: list[int] = []
        self.location: Location = Location(x, y)

    def setup_cell(self, cell_state_type: str) -> None:
        cell_state_type = cell_state_type.upper().strip()

        if cell_state_type == "CHARGING":
            self._type = CellType.CHARGING_CELL
        elif cell_state_type == "KILLER":
            self._type = CellType.KILLER_CELL
        elif cell_state_type == "SPAWN":
            self._type = CellType.SPAWN_CELL

    def is_charging_cell(self) -> bool:
        return self._type == CellType.CHARGING_CELL

    def is_killer_cell(self) -> bool:
        return self._type == CellType.KILLER_CELL

    def is_normal_cell(self) -> bool:
        return self._type == CellType.NORMAL_CELL

    def is_spawn_cell(self) -> bool:
        return self._type == CellType.SPAWN_CELL

    def set_spawn_cell(self) -> None:
        self._type = CellType.SPAWN_CELL

    def set_charging_cell(self) -> None:
        self._type = CellType.CHARGING_CELL

    def set_killer_cell(self) -> None:
        self._type = CellType.KILLER_CELL

    def get_layers(self) -> list[WorldObject]:
        return self._layers

    def add_layer(self, layer: WorldObject) -> None:
        self._layers.append(layer)

    def remove_top_layer(self) -> WorldObject | None:
        if not self._layers:
            return None
        return self._layers.pop()

    def get_top_layer(self) -> WorldObject | None:
        if not self._layers:
            return None
        return self._layers[-1]

    def set_top_layer(self, top_layer: WorldObject | None) -> None:
        self._layers.clear()
        if top_layer is None:
            return
        self._layers.append(top_layer)

    def get_cell_info(self) -> CellInfo:
        cell_type = CellType.NORMAL_CELL

        if self.is_killer_cell():
            cell_type = CellType.KILLER_CELL
        elif self.is_charging_cell():
            cell_type = CellType.CHARGING_CELL

        loc = Location(self.location.x, self.location.y)
        return CellInfo(
            cell_type,
            loc,
            self.move_cost,
            self.agents[:],
            self.get_top_layer(),
        )

    def number_of_survivors(self) -> int:
        count = 0
        for layer in self._layers:
            if isinstance(layer, Survivor):
                count += 1
        return count

    @override
    def __str__(self) -> str:
        if not self._layers:
            layers_str = "  (no layers)"
        else:
            layers_str = "\n".join(
                f"  {i + 1} - {layer}" for i, layer in enumerate(reversed(self._layers))
            )

        return (
            f"Cell at ({self.location.x}, {self.location.y}) - "
            f"Move Cost: {self.move_cost}\n"
            f"Type: {self._type}\n"
            f"Layers:\n"
            f"{layers_str}\n"
        )

    @override
    def __repr__(self) -> str:
        return self.__str__()
