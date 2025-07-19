from __future__ import annotations

from typing import override

from _aegis.common import (
    CellType,
    Location,
)
from _aegis.common.agent_id import AgentID
from _aegis.common.world.info import CellInfo
from _aegis.common.world.objects import Survivor, WorldObject


class Cell:
    def __init__(self, x: int | None = None, y: int | None = None) -> None:
        self._type: CellType = CellType.NO_CELL
        self.move_cost: int = 1
        self.agent_id_list: list[AgentID] = []
        self._cell_layer_list: list[WorldObject] = []

        if x is not None and y is not None:
            self.location: Location = Location(x, y)
        else:
            self.location = Location(-1, -1)

    def setup_cell(self, cell_state_type: str) -> None:
        cell_state_type = cell_state_type.upper().strip()

        if cell_state_type == "CHARGING":
            self._type = CellType.CHARGING_CELL
        elif cell_state_type == "KILLER":
            self._type = CellType.KILLER_CELL
        elif cell_state_type == "SPAWNS":
            self._type = CellType.SPAWN_CELL
        else:
            self._type = CellType.NORMAL_CELL

    def is_charging_cell(self) -> bool:
        return self._type == CellType.CHARGING_CELL

    def is_killer_cell(self) -> bool:
        return self._type == CellType.KILLER_CELL

    def is_normal_cell(self) -> bool:
        return self._type == CellType.NORMAL_CELL

    def is_spawn_cell(self) -> bool:
        return self._type == CellType.SPAWN_CELL

    def set_normal_cell(self) -> None:
        self._type = CellType.NORMAL_CELL

    def set_spawn_cell(self) -> None:
        self._type = CellType.SPAWN_CELL

    def set_charging_cell(self) -> None:
        self._type = CellType.CHARGING_CELL

    def set_killer_cell(self) -> None:
        self._type = CellType.KILLER_CELL

    def get_cell_layers(self) -> list[WorldObject]:
        return self._cell_layer_list

    def add_layer(self, layer: WorldObject) -> None:
        self._cell_layer_list.append(layer)

    def remove_top_layer(self) -> WorldObject | None:
        if not self._cell_layer_list:
            return None
        return self._cell_layer_list.pop()

    def get_top_layer(self) -> WorldObject | None:
        if not self._cell_layer_list:
            return None
        return self._cell_layer_list[-1]

    def set_top_layer(self, top_layer: WorldObject | None) -> None:
        self._cell_layer_list.clear()
        if top_layer is None:
            return
        self._cell_layer_list.append(top_layer)

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
            [AgentID(agent_id.id, agent_id.gid) for agent_id in self.agent_id_list],
            self.get_top_layer(),
        )

    def number_of_survivors(self) -> int:
        count = 0
        for layer in self._cell_layer_list:
            if isinstance(layer, Survivor):
                count += 1
        return count

    @override
    def __str__(self) -> str:
        if not self._cell_layer_list:
            layers_str = "  (no layers)"
        else:
            layers_str = "\n".join(
                f"  {i + 1} - {layer}"
                for i, layer in enumerate(reversed(self._cell_layer_list))
            )

        return (
            f"Cell at ({self.location.x}, {self.location.y}) - "
            f"Move Cost: {self.move_cost}\n"
            f"Layers:\n"
            f"{layers_str}\n"
        )

    @override
    def __repr__(self) -> str:
        return self.__str__()
