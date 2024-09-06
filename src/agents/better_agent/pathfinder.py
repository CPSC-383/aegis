from __future__ import annotations

import heapq
import math

from agent.base_agent import BaseAgent
from aegis.common import Location, Direction
from aegis.common.world.world import World


class _Node:
    def __init__(self, location: Location, parent: _Node | None = None) -> None:
        self.parent = parent
        self.location = location
        self.f = float("inf")  # Total cost
        self.g = float("inf")  # Distance between start and end
        self.h = float("inf")  # Heuristic; estimated distance between start and end

    def __lt__(self, other: _Node) -> bool:
        return self.f < other.f


class Pathfinder:
    def _heuristic(self, curr: Location, end: Location) -> float:
        # Use Euclidean Distance
        dx = curr.x - end.x
        dy = curr.y - end.y
        return math.sqrt(dx**2 + dy**2)

    def _convert_path_to_directions(self, path: list[Location]) -> list[Direction]:
        directions: list[Direction] = []
        for i in range(len(path) - 1):
            start_loc = path[i]
            end_loc = path[i + 1]
            dx = end_loc.x - start_loc.x
            dy = end_loc.y - start_loc.y

            for direction in Direction:
                if direction.dx == dx and direction.dy == dy:
                    directions.append(direction)
                    break
        return directions

    def _path(self, node: _Node | None) -> list[Location]:
        path: list[Location] = []
        while node:
            path.append(node.location)
            node = node.parent
        return path[::-1]

    def a_star(
        self, world: World | None, agent: BaseAgent, start: Location, end: Location
    ) -> list[Direction]:
        if world is None:
            return []

        open: list[_Node] = []  # Nodes to be evaluated
        closed: set[Location] = set()  # Nodes already evaluated

        start_node = _Node(start)
        end_node = _Node(end)

        start_node.g = 0
        start_node.h = self._heuristic(start_node.location, end_node.location)
        start_node.f = start_node.h

        heapq.heappush(open, start_node)

        while open:
            curr_node = heapq.heappop(open)

            if curr_node.location == end_node.location:
                path = self._path(curr_node)
                return self._convert_path_to_directions(path)

            closed.add(curr_node.location)

            for dir in Direction:
                loc = curr_node.location.add(dir)

                grid = world.get_grid_at(loc)
                if (
                    grid is None
                    or grid.move_cost >= agent.get_energy_level()
                    or grid.is_killer()
                ):
                    continue

                loc_node = _Node(loc, curr_node)
                loc_node.g = curr_node.g + grid.move_cost
                loc_node.h = self._heuristic(loc_node.location, end_node.location)
                loc_node.f = loc_node.g + loc_node.h

                if loc_node.location in closed:
                    continue

                if loc_node in open:
                    i = open.index(loc_node)
                    if loc_node.g < open[i].g:
                        open[i] = loc_node
                        heapq.heapify(open)
                else:
                    heapq.heappush(open, loc_node)

        return []
