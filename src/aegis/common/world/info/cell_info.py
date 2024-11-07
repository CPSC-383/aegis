from typing import override

from aegis.common import AgentIDList, CellType, Location
from aegis.common.world.objects import WorldObject


class CellInfo:
    """
    Represents the information of a cell in the world.

    Attributes:
        cell_type (CellType): The type of the cell.
        location (Location): The location of the cell in the world.
        on_fire (bool): A boolean indicating if the cell is on fire.
        move_cost (int): The cost to move through the cell.
        agent_id_list (AgentIDList): A list of agent IDs on the cell.
        top_layer (WorldObject | None): Information about the top layer object.
    """

    def __init__(
        self,
        cell_type: CellType = CellType.NO_CELL,
        location: Location | None = None,
        on_fire: bool = False,
        move_cost: int = 0,
        agent_id_list: AgentIDList | None = None,
        top_layer: WorldObject | None = None,
    ) -> None:
        """
        Initializes a CellInfo instance.

        Args:
            cell_type: The type of the cell.
            location: The location of the cell.
            on_fire: Indicates if the cell is on fire.
            move_cost: The cost to move through the cell.
            agent_id_list: List of agent IDs on the cell.
            top_layer: Information about the top layer object.
        """
        self.cell_type = cell_type
        self.location = location if location is not None else Location(-1, -1)
        self.on_fire = on_fire
        self.move_cost = move_cost
        self.agent_id_list = (
            agent_id_list if agent_id_list is not None else AgentIDList()
        )
        self.top_layer = top_layer if top_layer is not None else None

    @override
    def __str__(self) -> str:
        if self.cell_type == CellType.NO_CELL:
            return self.cell_type.name
        return (
            f"{self.cell_type.name} ( X {self.location.x} , Y {self.location.y} , "
            f"ON_FIRE {str(self.on_fire).upper()} , MV_COST {self.move_cost} , "
            f"NUM_AGT {self.agent_id_list.size()} , ID_LIST {str(self.agent_id_list)} , "
            f"TOP_LAYER ( {self.top_layer} ) )"
        )
