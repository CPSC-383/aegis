from __future__ import annotations

import heapq

from agent.base_agent import BaseAgent
from aegis.common import Location, Direction
from aegis.common.world.world import World


class Pathfinder:
    def _heuristic(self, curr: Location, end: Location) -> int:
        # Use Chebyshev Distance
        dx = curr.x - end.x
        dy = curr.y - end.y
        return max(abs(dx), abs(dy))

    def a_star(
        self, world: World | None, agent: BaseAgent, start: Location, end: Location
    ) -> Direction:
        if world is None:
            return Direction.CENTER

        frontier: list[tuple[int, Location]] = []
        heapq.heappush(frontier, (0, start))
        came_from: dict[Location, Location] = {start: start}
        cost_so_far: dict[Location, int] = {start: 0}

        while frontier:
            _, current = heapq.heappop(frontier)

            if current == end:
                path = self.remake_path(came_from, start, end)
                path.append(end)

                next_loc = path[1]
                dx = next_loc.x - start.x
                dy = next_loc.y - start.y
                return Direction(dx, dy)

            for dir in Direction:
                loc = current.add(dir)
                cell = world.get_cell_at(loc)

                if (
                    cell is None
                    or cell.move_cost >= agent.get_energy_level()
                    or cell.is_killer_cell()
                    or cell.is_fire_cell()
                ):
                    continue

                new_cost = cost_so_far[current] + cell.move_cost
                if loc not in cost_so_far or new_cost < cost_so_far[loc]:
                    cost_so_far[loc] = new_cost
                    prio = new_cost + self._heuristic(loc, end)
                    heapq.heappush(frontier, (prio, loc))
                    came_from[loc] = current

        return Direction.CENTER

    def remake_path(
        self, came_from: dict[Location, Location], start: Location, end: Location
    ) -> list[Location]:
        current = end
        path: list[Location] = []
        while current != start:
            previous = came_from[current]
            path.append(previous)
            current = previous
        path.reverse()  # Reverse to get the path from start to end
        return path
