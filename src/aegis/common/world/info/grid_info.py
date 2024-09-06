from typing import override

from aegis.common import AgentIDList, GridType, Location
from aegis.common.world.info.no_layers_info import NoLayersInfo
from aegis.common.world.info.world_object_info import WorldObjectInfo


class GridInfo:
    """
    Represents the information of a grid in the world.

    Attributes:
        grid_type (GridType): The type of the grid.
        location (Location): The location of the grid in the world.
        on_fire (bool): A boolean indicating if the grid is on fire.
        move_cost (int): The cost to move through the grid.
        agent_id_list (AgentIDList): A list of agent IDs on the grid.
        top_layer_info (WorldObjectInfo): Information about the top layer object.
    """

    def __init__(
        self,
        grid_type: GridType = GridType.NO_GRID,
        location: Location | None = None,
        on_fire: bool = False,
        move_cost: int = 0,
        agent_id_list: AgentIDList | None = None,
        top_layer_info: WorldObjectInfo | None = None,
    ) -> None:
        """
        Initializes a GridInfo instance.

        Args:
            grid_type: The type of the grid.
            location: The location of the grid.
            on_fire: Indicates if the grid is on fire.
            move_cost: The cost to move through the grid.
            agent_id_list: List of agent IDs on the grid.
            top_layer_info: Information about the top layer object.
        """
        self.grid_type = grid_type
        self.location = location if location is not None else Location(-1, -1)
        self.on_fire = on_fire
        self.move_cost = move_cost
        self.agent_id_list = (
            agent_id_list if agent_id_list is not None else AgentIDList()
        )
        self.top_layer_info = (
            top_layer_info if top_layer_info is not None else NoLayersInfo()
        )

    def distort_info(self, factor: int) -> None:
        self.top_layer_info.distort_info(factor)

    @override
    def __str__(self) -> str:
        if self.grid_type == GridType.NO_GRID:
            return self.grid_type.name
        return (
            f"{self.grid_type.name} ( X {self.location.x} , Y {self.location.y} , "
            f"ON_FIRE {str(self.on_fire).upper()} , MV_COST {self.move_cost} , "
            f"NUM_AGT {self.agent_id_list.size()} , ID_LIST {str(self.agent_id_list)} , "
            f"TOP_LAYER ( {self.top_layer_info} ) )"
        )
