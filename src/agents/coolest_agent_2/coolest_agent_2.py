from typing import override

from aegis import (
    CONNECT_OK,
    END_TURN,
    SEND_MESSAGE_RESULT,
    MOVE,
    MOVE_RESULT,
    OBSERVE_RESULT,
    PREDICT_RESULT,
    SAVE_SURV,
    SAVE_SURV_RESULT,
    SLEEP_RESULT,
    TEAM_DIG_RESULT,
    AgentCommand,
    Direction,
    SurroundInfo,
    Survivor,
    Location,
    World,
    SEND_MESSAGE,
    AgentIDList,
)
from aegis.common.agent_id import AgentID
from aegis.common.commands.agent_commands import TEAM_DIG
from aegis.common.world.objects.rubble import Rubble
from agent import BaseAgent, Brain, LogLevels


class CoolestAgent2(Brain):
    locs_with_survs: dict[Location, int] = {}

    def __init__(self) -> None:
        super().__init__()
        self._agent = BaseAgent.get_base_agent()

    @override
    def handle_connect_ok(self, connect_ok: CONNECT_OK) -> None:
        BaseAgent.log(LogLevels.Always, "CONNECT_OK")

    @override
    def handle_disconnect(self) -> None:
        BaseAgent.log(LogLevels.Always, "DISCONNECT")

    @override
    def handle_dead(self) -> None:
        BaseAgent.log(LogLevels.Always, "DEAD")

    @override
    def handle_send_message_result(self, smr: SEND_MESSAGE_RESULT) -> None:
        # BaseAgent.log(LogLevels.Always, f"SEND_MESSAGE_RESULT: {smr}")
        # BaseAgent.log(LogLevels.Test, f"{smr}")
        BaseAgent.log(LogLevels.Always, f"\tfrom {smr.from_agent_id.id}: {smr.msg}")

    @override
    def handle_move_result(self, mr: MOVE_RESULT) -> None:
        # BaseAgent.log(LogLevels.Always, f"MOVE_RESULT: {mr}")
        # BaseAgent.log(LogLevels.Test, f"{mr}")
        self.update_surround(mr.surround_info)

    @override
    def handle_observe_result(self, ovr: OBSERVE_RESULT) -> None:
        BaseAgent.log(LogLevels.Always, f"OBSERVER_RESULT: {ovr}")
        BaseAgent.log(LogLevels.Always, f"{ovr.energy_level}")
        BaseAgent.log(LogLevels.Always, f"{ovr.life_signals}")
        BaseAgent.log(LogLevels.Always, f"{ovr.cell_info}")
        BaseAgent.log(LogLevels.Test, f"{ovr}")

    @override
    def handle_save_surv_result(self, ssr: SAVE_SURV_RESULT) -> None:
        BaseAgent.log(LogLevels.Always, f"SAVE_SURV_RESULT: {ssr}")
        self.update_surround(ssr.surround_info)

    @override
    def handle_predict_result(self, prd: PREDICT_RESULT) -> None:
        BaseAgent.log(LogLevels.Always, f"PREDICT_RESULT: {prd}")
        BaseAgent.log(LogLevels.Test, f"{prd}")

    @override
    def handle_sleep_result(self, sr: SLEEP_RESULT) -> None:
        BaseAgent.log(LogLevels.Always, f"SLEEP_RESULT: {sr}")
        BaseAgent.log(LogLevels.Test, f"{sr}")

    @override
    def handle_team_dig_result(self, tdr: TEAM_DIG_RESULT) -> None:
        BaseAgent.log(LogLevels.Always, f"TEAM_DIG_RSULT: {tdr}")
        self.update_surround(tdr.surround_info)

    @override
    def think(self) -> None:
        BaseAgent.log(LogLevels.Always, "Thinking")

        # # On the first round, send a request for surrounding information
        # # by moving to the center (not moving). This will help initiate pathfinding.
        # if self._agent.get_round_number() == 1:
        #     self.send_and_end_turn(MOVE(Direction.CENTER))
        #     return
        world = self.get_world()
        if world is None:
            return
        if self._agent.get_round_number() == 1:
            # send a message of our current location to agent id 1 (team leader!)
            self._agent.send(
                SEND_MESSAGE(
                    AgentIDList([AgentID(1, self._agent.get_agent_id().gid)]),
                    f"ID: {self._agent.get_agent_id().id} @ {self._agent.get_location()}",
                )
            )

        self.locs_with_survs = {}
        # Retrieve the current state of the world, and find all the survivors on the map
        self.populate_surv_spots(world)

        # move to closest survivor, and once on top, dig rubbble or save surv, whatever is on the top layer
        # if no survivors are found, move to the center

        # find the closest survivor
        surv_loc: Location = self.get_closest_survivor()
        # surv_loc = self.get_best_location(world)
        print(f"Closest survivor: {surv_loc}")

        # if on top of the closest surv, try saving it or digging to it, depending on what the top layer is
        if self._agent.get_location() == surv_loc:
            print("On top of closest survivor")
            cell = world.get_cell_at(surv_loc)
            if cell is None:
                # BaseAgent.log(LogLevels.Always, "\n\t\tCell is None when i am on the surv loc???????")
                return
            top_layer = cell.get_top_layer()

            print(f"current loc: {self._agent.get_location()} | surv loc: {surv_loc}")
            print(f"Top layer: {top_layer}")
            print(f"Top layer type: {type(top_layer)}")
            if top_layer is None:
                # nothing here anymore, find a new closest surv
                cell.has_survivors = False
                self.locs_with_survs.pop(surv_loc)
                surv_loc = self.get_closest_survivor()
            if isinstance(top_layer, Rubble):
                self.send_and_end_turn(TEAM_DIG())
                return
            elif isinstance(top_layer, Survivor):
                self.send_and_end_turn(SAVE_SURV())
                return

        # if not on top of the closest surv, move to it
        print("Moving to closest survivor at ", surv_loc)
        dir_to_goal: Direction = self.move_towards_goal(surv_loc)
        print(dir_to_goal)
        self.send_and_end_turn(MOVE(dir_to_goal))
        return

        # # # Default action: Move the agent north if no other specific conditions are met.
        # print("Didn't send a command, thats not good...")
        # self.send_and_end_turn(MOVE(Direction.CENTER))

    def send_and_end_turn(self, command: AgentCommand):
        """Send a command and end your turn."""
        BaseAgent.log(LogLevels.Always, f"SENDING {command}")
        self._agent.send(command)
        self._agent.send(END_TURN())

    def update_surround(self, surround_info: SurroundInfo):
        """Updates the current and surrounding cells of the agent."""
        world = self.get_world()
        if world is None:
            return

        for dir in Direction:
            cell_info = surround_info.get_surround_info(dir)
            if cell_info is None:
                continue

            cell = world.get_cell_at(cell_info.location)
            if cell is None:
                continue

            cell.move_cost = cell_info.move_cost
            cell.set_top_layer(cell_info.top_layer)

    def populate_surv_spots(self, world: World):
        for row in world.get_world_grid():
            for cell in row:
                if cell.has_survivors:
                    self.locs_with_survs[cell.location] = cell.has_survivors

    def get_closest_survivor(self) -> Location:
        closest_surv: Location = Location(0, 0)
        closest_dist = 1000
        for loc, _ in self.locs_with_survs.items():
            distance_to_surv = self._agent.get_location().distance_to(loc)
            if distance_to_surv < closest_dist:
                closest_surv = loc
                closest_dist = distance_to_surv
        return closest_surv

    # def get_best_location(self, world: World) -> Location:
    #     best_cell = world.get_world_grid()[0][0]
    #     for x in range(world.width):
    #         for y in range(world.height):
    #             cell = world.get_cell_at(Location(x, y))
    #             if cell is None:
    #                 continue

    #             if cell.survivor_chance > best_cell.survivor_chance:
    #                 best_cell = cell

    #     return best_cell.location

    def move_towards_goal(self, goal: Location) -> Direction:
        agent_loc = self._agent.get_location()
        dir_to_goal = agent_loc.direction_to(goal)
        return dir_to_goal
