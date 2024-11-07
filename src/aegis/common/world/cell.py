from __future__ import annotations

from typing import override

from aegis.common import (
    AgentIDList,
    Constants,
    CellType,
    LifeSignals,
    Location,
    Utility,
)
from aegis.common.world.info import CellInfo
from aegis.common.world.objects import Survivor, SurvivorGroup, WorldObject


class Cell:
    """
    Represents a cell in the world.

    Attributes:
        move_cost (int): The movement cost associated with the cell.
        agent_id_list (AgentIDList): List of agent IDs present in the cell.
        survivor_chance (int): The percent chance that there are survivors in the cell.
        stored_life_signals (LifeSignals): The life signals stored in the cell.
        location (Location): The location of the cell on the map.
    """

    def __init__(
        self,
        x: int | None = None,
        y: int | None = None,
    ) -> None:
        """
        Initializes a Cell instance.

        Args:
            x: The x-coordinate of the cell.
            y: The y-coordinate of the cell.
        """
        self._type = CellType.NO_CELL
        self._on_fire = False
        self.move_cost = 1
        self.agent_id_list = AgentIDList()
        self._cell_layer_list: list[WorldObject] = []
        self.survivor_chance = -1
        self.stored_life_signals = LifeSignals()

        if x is not None and y is not None:
            self.location = Location(x, y)
        else:
            self.location = Location(-1, -1)

    def setup_cell(self, cell_state_type: str) -> None:
        cell_state_type = cell_state_type.upper().strip()

        if cell_state_type == "NORMAL_CELLS":
            self._type = CellType.NORMAL_CELL
            self._on_fire = False
        elif cell_state_type == "CHARGING_CELLS":
            self._type = CellType.CHARGING_CELL
            self._on_fire = False
        elif cell_state_type == "FIRE_CELLS":
            self._type = CellType.FIRE_CELL
            self._on_fire = True
        elif cell_state_type == "KILLER_CELLS":
            self._type = CellType.KILLER_CELL
            self._on_fire = False

    def is_charging_cell(self) -> bool:
        """
        Checks if the cell is of type CHARGING_CELL.

        Returns:
            True if the cell type is CHARGING_CELL, False otherwise.
        """
        return self._type == CellType.CHARGING_CELL

    def is_fire_cell(self) -> bool:
        """
        Checks if the cell is of type FIRE_CELL.

        Returns:
            True if the cell type is FIRE_CELL, False otherwise.
        """
        return self._type == CellType.FIRE_CELL

    def is_killer_cell(self) -> bool:
        """
        Checks if the cell is of type KILLER_CELL.

        Returns:
            True if the cell type is KILLER_CELL, False otherwise.
        """
        return self._type == CellType.KILLER_CELL

    def is_normal_cell(self) -> bool:
        """
        Checks if the cell is of type NORMAL_CELL.

        Returns:
            True if the cell type is NORMAL_CELL, False otherwise.
        """
        return self._type == CellType.NORMAL_CELL

    def set_normal_cell(self) -> None:
        self._type = CellType.NORMAL_CELL

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
        """
        Returns the top layer of the cell without removing it if the cell has layers.

        Returns:
            The top layer, or None if the cell has no layers.
        """
        if not self._cell_layer_list:
            return None
        return self._cell_layer_list[-1]

    def set_top_layer(self, top_layer: WorldObject | None) -> None:
        """
        Sets the top layer of the cell, replacing any existing layers.

        Args:
            top_layer: The new top layer for the cell.
        """
        self._cell_layer_list.clear()
        if top_layer is None:
            return
        self._cell_layer_list.append(top_layer)

    def number_of_layers(self) -> int:
        return len(self._cell_layer_list)

    def is_on_fire(self) -> bool:
        """
        Checks if the cell is currently on fire.

        Returns:
            True if the cell is on fire, False otherwise.
        """
        return self._on_fire

    def set_on_fire(self, on_fire: bool) -> None:
        if on_fire:
            self._on_fire = on_fire
            self._type = CellType.FIRE_CELL
        else:
            self._on_fire = on_fire
            self._type = CellType.NORMAL_CELL

    def get_cell_info(self) -> CellInfo:
        cell_type = CellType.NORMAL_CELL

        if self.is_fire_cell():
            cell_type = CellType.FIRE_CELL
        elif self.is_killer_cell():
            cell_type = CellType.KILLER_CELL
        elif self.is_charging_cell():
            cell_type = CellType.CHARGING_CELL

        return CellInfo(
            cell_type,
            self.location.clone(),
            self._on_fire,
            self.move_cost,
            self.agent_id_list.clone(),
            self.get_top_layer(),
        )

    def number_of_survivors(self) -> int:
        count = 0
        for layer in self._cell_layer_list:
            if isinstance(layer, Survivor):
                count += 1
            if isinstance(layer, SurvivorGroup):
                count += layer.number_of_survivors
        return count

    def get_generated_life_signals(self) -> LifeSignals:
        layer = self.number_of_layers() - 1
        i = 0
        if not self._cell_layer_list:
            return LifeSignals()
        life_signals: list[int] = [0] * self.number_of_layers()
        life_signals[i] = self._cell_layer_list[layer].get_life_signal()
        i += 1
        layer -= 1

        low_range = Constants.DEPTH_LOW_START
        high_range = Constants.DEPTH_HIGH_START
        while layer >= 0:
            lss = self._cell_layer_list[layer].get_life_signal()
            distortion = Utility.random_in_range(low_range, high_range)
            if distortion > lss:
                lss = 0
            else:
                lss -= distortion
            life_signals[i] = lss
            i += 1
            layer -= 1
            low_range += Constants.DEPTH_LOW_INC
            high_range += Constants.DEPTH_HIGH_INC

        return LifeSignals(life_signals)

    @override
    def __str__(self) -> str:
        s = f"Cell ( ({self.location.x},{self.location.y}), Move_Cost {self.move_cost}) \n\t\t{{\n"
        for layer in self._cell_layer_list:
            s += f"\t\t    {layer.file_output_string()};\n"
        s += "\t\t}\n\n"
        return s

    @override
    def __repr__(self) -> str:
        return self.__str__()

    def clone(self) -> Cell:
        """
        Creates and returns a copy of the cell.

        Returns:
            Cell: A new Cell instance with the same attributes.
        """
        cell = Cell()
        cell._type = self._type
        cell.location = self.location
        cell.agent_id_list = self.agent_id_list.clone()
        cell._cell_layer_list = [layer.clone() for layer in self._cell_layer_list]
        cell._on_fire = self._on_fire
        cell.move_cost = self.move_cost
        cell.survivor_chance = self.survivor_chance
        return cell
