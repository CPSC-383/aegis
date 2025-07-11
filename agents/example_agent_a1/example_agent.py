import heapq
from typing import override

# If you need to import anything, add it to the import below.
from aegis import (
    END_TURN,
    MOVE,
    SAVE_SURV,
    AgentCommand,
    BaseAgent,
    Brain,
    Direction,
    Survivor,
    Location,
    World,
    SLEEP,
)


class Pathfinder:
    def _heuristic(self, curr: Location, end: Location) -> int:
        # Use Chebyshev Distance
        dx = curr.x - end.x
        dy = curr.y - end.y
        return max(abs(dx), abs(dy))

    def a_star(
        self,
        world: World | None,
        agent: BaseAgent,
        start: Location,
        end: Location,
    ) -> tuple[Direction, int]:
        if world is None:
            print("WORLD IS NONE")
            return Direction.CENTER, 0

        frontier: list[tuple[int, Location]] = []
        heapq.heappush(frontier, (0, start))
        came_from: dict[Location, Location] = {start: start}
        cost_so_far: dict[Location, int] = {start: 0}

        while frontier:
            _, current = heapq.heappop(frontier)

            if current == end:
                path = self.remake_path(came_from, start, end)
                path.append(end)
                return start.direction_to(path[1]), cost_so_far[path[-1]]

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

        return Direction.CENTER, 0

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


class ExampleAgent(Brain):
    def __init__(self) -> None:
        super().__init__()
        self._agent: BaseAgent = BaseAgent.get_agent()
        self.pathfinder: Pathfinder = Pathfinder()

    @override
    def think(self) -> None:
        self._agent.log("Thinking")

        if self._agent.get_round_number() == 1:
            self.send_and_end_turn(MOVE(Direction.CENTER))
            return

        world = self.get_world()
        if world is None:
            self.send_and_end_turn(MOVE(Direction.CENTER))
            return

        goal = world.get_world_grid()[0][0]
        charging_cell = None
        for row in world.get_world_grid():
            for cell in row:
                if cell.has_survivors:
                    goal = cell
                elif cell.is_charging_cell() and charging_cell is None:
                    charging_cell = cell

        if goal.location == self._agent.get_location():
            top_layer = goal.get_top_layer()
            if isinstance(top_layer, Survivor):
                self.send_and_end_turn(SAVE_SURV())
                return

        dir, cost = self.move(world, goal.location)
        if (
            charging_cell
            and charging_cell.location == self._agent.get_location()
            and (
                self._agent.get_energy_level() == 1
                or cost + 1 >= self._agent.get_energy_level()
            )
        ):
            self.send_and_end_turn(SLEEP())
            return

        if charging_cell and cost + 1 > self._agent.get_energy_level():
            dir, _ = self.move(world, charging_cell.location)
            self.send_and_end_turn(dir)
            return

        self.send_and_end_turn(dir)

    def move(self, world: World, loc: Location) -> tuple[MOVE, int]:
        dir, cost = Pathfinder().a_star(
            world, self._agent, self._agent.get_location(), loc
        )

        return MOVE(dir), cost

    def send_and_end_turn(self, command: AgentCommand):
        """Send a command and end your turn."""
        self._agent.log(f"SENDING {command}")
        self._agent.send(command)
        self._agent.send(END_TURN())
