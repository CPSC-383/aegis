from aegis.common import Direction, Utility
from aegis.common.world.cell import Cell
from aegis.common.world.world import World


class FireSimulator:
    def __init__(
        self,
        fire_cells_list: list[Cell],
        non_fire_cells_list: list[Cell],
        world: World | None,
    ) -> None:
        self._fire_cells_list = fire_cells_list
        self._non_fire_cells_list = non_fire_cells_list
        self._world = world

    def run(self) -> str:
        s = ""
        if not self._non_fire_cells_list or self._world is None:
            return s
        count = 0
        number_to_spread = Utility.random_in_range(0, 2)
        s += "Fire Cells; { "
        for _ in range(number_to_spread):
            fire_cell = self._fire_cells_list[
                Utility.random_in_range(0, len(self._fire_cells_list) - 1)
            ]
            number_of_directions = Utility.random_in_range(1, 3)
            for _ in range(number_of_directions):
                dir = Direction.get_random_direction()
                spread_cell = self._world.get_cell_at(fire_cell.location.add(dir))
                if spread_cell is None or spread_cell.is_on_fire():
                    continue

                s += f"{spread_cell.location.proc_string()}"
                count += 1
                self._non_fire_cells_list.remove(spread_cell)
                spread_cell.set_on_fire(True)
                self._fire_cells_list.append(spread_cell)
        if count <= 0:
            s += "NONE"
        s += " };\n"
        return s
