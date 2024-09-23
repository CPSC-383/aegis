from __future__ import annotations

from enum import Enum

from aegis.common import (
    AgentIDList,
    Constants,
    GridType,
    LifeSignals,
    Location,
    Utility,
)
from aegis.common.world.info import NoLayersInfo, GridInfo, WorldObjectInfo
from aegis.common.world.objects import Survivor, SurvivorGroup, WorldObject


class _State(Enum):
    """Enum for the state of the grid."""

    STABLE_GRID = 1
    KILLER_GRID = 2


class Grid:
    """
    Represents a grid in the world.

    Attributes:
        move_cost (int): The movement cost associated with the grid.
        agent_id_list (AgentIDList): List of agent IDs present in the grid.
        percent_chance (int): The percentage chance that there are survivors in the grid.
        stored_life_signals (LifeSignals): The life signals stored in the grid.
        location (Location): The location of the grid on the map.
    """

    def __init__(
        self,
        x: int | None = None,
        y: int | None = None,
    ) -> None:
        """
        Initializes a Grid instance.

        Args:
            x: The x-coordinate of the grid.
            y: The y-coordinate of the grid.
        """
        self._type = GridType.NO_GRID
        self._state = _State.STABLE_GRID
        self._on_fire = False
        self.move_cost = 1
        self.agent_id_list = AgentIDList()
        self._grid_layer_list: list[WorldObject] = []
        self.percent_chance = -1
        self.stored_life_signals = LifeSignals()

        if x is not None and y is not None:
            self.location = Location(x, y)
        else:
            self.location = Location(-1, -1)

    def setup_grid(self, grid_state_type: str) -> None:
        """
        Configures the grid based on the provided state type.

        Args:
            grid_state_type: The state type of the grid.
        """
        grid_state_type = grid_state_type.upper().strip()

        if grid_state_type == "NORMAL_GRIDS":
            self._type = GridType.NORMAL_GRID
            self._on_fire = False
            self._state = _State.STABLE_GRID
        elif grid_state_type == "CHARGING_GRIDS":
            self._type = GridType.CHARGING_GRID
            self._on_fire = False
            self._state = _State.STABLE_GRID
        elif grid_state_type == "FIRE_GRIDS":
            self._type = GridType.FIRE_GRID
            self._on_fire = True
            self._state = _State.KILLER_GRID
        elif grid_state_type == "KILLER_GRIDS":
            self._type = GridType.KILLER_GRID
            self._on_fire = False
            self._state = _State.KILLER_GRID

    def is_charging_grid(self) -> bool:
        """
        Checks if the grid is of type CHARGING_GRID.

        Returns:
            True if the grid type is CHARGING_GRID, False otherwise.
        """
        return self._type == GridType.CHARGING_GRID

    def is_fire_grid(self) -> bool:
        """
        Checks if the grid is of type FIRE_GRID.

        Returns:
            True if the grid type is FIRE_GRID, False otherwise.
        """
        return self._type == GridType.FIRE_GRID

    def is_killer_grid(self) -> bool:
        """
        Checks if the grid is of type KILLER_GRID.

        Returns:
            True if the grid type is KILLER_GRID, False otherwise.
        """
        return self._type == GridType.KILLER_GRID

    def set_normal_grid(self) -> None:
        """Sets the grid type to NORMAL_GRID."""
        self._type = GridType.NORMAL_GRID

    def set_charging_grid(self) -> None:
        """Sets the grid type to CHARGING_GRID."""
        self._type = GridType.CHARGING_GRID

    def set_killer_grid(self) -> None:
        """Sets the grid type to KILLER_GRID."""
        self._type = GridType.KILLER_GRID

    def is_stable(self) -> bool:
        """
        Checks if the grid state is STABLE_GRID.

        Returns:
            True if the grid state is STABLE_GRID, False otherwise.
        """
        return self._state == _State.STABLE_GRID

    def is_killer(self) -> bool:
        """
        Checks if the grid state is KILLER_GRID.

        Returns:
            True if the grid state is KILLER_GRID, False otherwise.
        """
        return self._state == _State.KILLER_GRID

    def set_stable(self) -> None:
        """Sets the grid state to STABLE_GRID."""
        self._state = _State.STABLE_GRID

    def set_killer(self) -> None:
        """Sets the grid state to KILLER_GRID."""
        self._state = _State.KILLER_GRID

    def get_grid_layers(self) -> list[WorldObject]:
        """Returns the list of grid layers."""
        return self._grid_layer_list

    def add_layer(self, layer: WorldObject) -> None:
        """
        Adds a layer to the grid.

        Args:
            layer: The layer to add to the grid.
        """
        self._grid_layer_list.append(layer)

    def remove_top_layer(self) -> WorldObject | None:
        """
        Removes and returns the top layer from the grid.

        Returns:
            The removed top layer, or None if the grid has no layers.
        """
        if not self._grid_layer_list:
            return None
        return self._grid_layer_list.pop()

    def get_top_layer(self) -> WorldObject | None:
        """
        Returns the top layer of the grid without removing it if the grid has layers.

        Returns:
            The top layer, or None if the grid has no layers.
        """
        if not self._grid_layer_list:
            return None
        return self._grid_layer_list[-1]

    def set_top_layer(self, top_layer: WorldObject) -> None:
        """
        Sets the top layer of the grid, replacing any existing layers.

        Args:
            top_layer: The new top layer for the grid.
        """
        self._grid_layer_list.clear()
        self._grid_layer_list.append(top_layer)

    def number_of_layers(self) -> int:
        """Returns the number of layers in the grid."""
        return len(self._grid_layer_list)

    def is_on_fire(self) -> bool:
        """
        Checks if the grid is currently on fire.

        Returns:
            True if the grid is on fire, False otherwise.
        """
        return self._on_fire

    def set_on_fire(self, on_fire: bool) -> None:
        """
        Sets the fire status of the grid.

        Args:
            on_fire: If True, sets the grid on fire; otherwise, extinguishes the fire.
        """
        if on_fire:
            self._on_fire = on_fire
            self._state = _State.KILLER_GRID
            self._type = GridType.FIRE_GRID
        else:
            self._on_fire = on_fire
            self._state = _State.STABLE_GRID
            self._type = GridType.NORMAL_GRID

    def get_grid_info(self) -> GridInfo:
        """Returns a GridInfo instance representing the current state of the grid."""
        grid_type = GridType.NORMAL_GRID

        if self.is_fire_grid():
            grid_type = GridType.FIRE_GRID
        elif self.is_killer_grid():
            grid_type = GridType.KILLER_GRID
        elif self.is_charging_grid():
            grid_type = GridType.CHARGING_GRID

        return GridInfo(
            grid_type,
            self.location.clone(),
            self._on_fire,
            self.move_cost,
            self.agent_id_list.clone(),
            self.top_layer_info(),
        )

    def top_layer_info(self) -> WorldObjectInfo:
        """Returns information about the top layer of the grid."""
        if self._grid_layer_list:
            top_layer = self.get_top_layer()
            if top_layer is not None:
                return top_layer.get_object_info()
        return NoLayersInfo()

    def number_of_survivors(self) -> int:
        """Returns the number of survivors in the grid."""
        count = 0
        for layer in self._grid_layer_list:
            if isinstance(layer, Survivor):
                count += 1
            if isinstance(layer, SurvivorGroup):
                count += layer.number_of_survivors
        return count

    def get_generated_life_signals(self) -> LifeSignals:
        """Returns the generated life signals based on the layers in the grid."""
        layer = self.number_of_layers() - 1
        i = 0
        if not self._grid_layer_list:
            return LifeSignals()
        life_signals: list[int] = [0] * self.number_of_layers()
        life_signals[i] = self._grid_layer_list[layer].get_life_signal()
        i += 1
        layer -= 1

        low_range = Constants.DEPTH_LOW_START
        high_range = Constants.DEPTH_HIGH_START
        while layer >= 0:
            lss = self._grid_layer_list[layer].get_life_signal()
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

    def file_output_string(self) -> str:
        """Returns a string representation of the grid suitable for file output."""
        s = f"Grid ( ({self.location.x},{self.location.y}), Move_Cost {self.move_cost}) \n\t\t{{\n"
        for layer in self._grid_layer_list:
            s += f"\t\t    {layer.file_output_string()};\n"
        s += "\t\t}\n\n"
        return s

    def clone(self) -> Grid:
        """
        Creates and returns a copy of the grid.

        Returns:
            Grid: A new Grid instance with the same attributes.
        """
        grid = Grid()
        grid._type = self._type
        grid._state = self._state
        grid.location = self.location
        grid.agent_id_list = self.agent_id_list.clone()
        grid._grid_layer_list = [layer.clone() for layer in self._grid_layer_list]
        grid._on_fire = self._on_fire
        grid.move_cost = self.move_cost
        grid.percent_chance = self.percent_chance
        return grid
