from aegis.common import Direction, Utility
from aegis.common.world.grid import Grid
from aegis.common.world.world import World


class FireSimulator:
    def __init__(
        self,
        fire_grids_list: list[Grid],
        non_fire_grids_list: list[Grid],
        world: World | None,
    ) -> None:
        self._fire_grids_list = fire_grids_list
        self._non_fire_grids_list = non_fire_grids_list
        self._world = world

    def run(self) -> str:
        s = ""
        if not self._non_fire_grids_list or self._world is None:
            return s
        count = 0
        number_to_spread = Utility.random_in_range(0, 2)
        s += "Fire Grids; { "
        for _ in range(number_to_spread):
            fire_grid = self._fire_grids_list[
                Utility.random_in_range(0, len(self._fire_grids_list) - 1)
            ]
            number_of_directions = Utility.random_in_range(1, 3)
            for _ in range(number_of_directions):
                dir = Direction.get_random_direction()
                spread_grid = self._world.get_grid_at(fire_grid.location.add(dir))
                if spread_grid is None or spread_grid.is_on_fire():
                    continue

                s += f"{spread_grid.location.proc_string()}"
                count += 1
                self._non_fire_grids_list.remove(spread_grid)
                spread_grid.set_on_fire(True)
                self._fire_grids_list.append(spread_grid)
        if count <= 0:
            s += "NONE"
        s += " };\n"
        return s
