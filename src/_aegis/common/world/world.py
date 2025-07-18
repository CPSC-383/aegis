from _aegis.common import Constants, Location
from _aegis.common.world.cell import Cell


class World:
    def __init__(
        self,
        world: list[list[Cell]] | None = None,
        width: int = 0,
        height: int = 0,
    ) -> None:
        if world is not None and (width == 0 and height == 0):
            self.height: int = len(world[0])
            self.width: int = len(world)
            self._world: list[list[Cell]] = world
        elif width > 0 and height > 0 and world is None:
            self.height = height
            self.width = width
            self._world = [[Cell(x, y) for y in range(height)] for x in range(width)]
        else:
            error = "Either 'world' OR 'width and height' must be passed into the class"
            raise ValueError(error)

        self._is_valid_map()

    def _is_valid_map(self) -> None:
        if self.width < Constants.WORLD_MIN:
            error = f"World width must be larger than {Constants.WORLD_MIN}"
            raise ValueError(error)

        if self.width > Constants.WORLD_MAX:
            error = f"World width must be beneath {Constants.WORLD_MAX}"
            raise ValueError(error)

        if self.height < Constants.WORLD_MIN:
            error = f"World height must be larger than {Constants.WORLD_MIN}"
            raise ValueError(error)

        if self.height > Constants.WORLD_MAX:
            error = f"World height must be beneath {Constants.WORLD_MAX}"
            raise ValueError(error)

    def on_map(self, location: Location) -> bool:
        return (
            location.x >= 0
            and location.y >= 0
            and location.x < self.width
            and location.y < self.height
        )

    def get_cell_at(self, location: Location) -> Cell | None:
        if not self.on_map(location):
            return None
        return self._world[location.x][location.y]

    def get_survs(self) -> list[Location]:
        res: list[Location] = []
        for row in self._world:
            for cell in row:
                if cell.number_of_survivors() <= 0:
                    continue
                res.append(cell.location)
        return res

    def get_charging_cells(self) -> list[Location]:
        res: list[Location] = []
        for row in self._world:
            for cell in row:
                if not cell.is_charging_cell():
                    continue
                res.append(cell.location)
        return res
