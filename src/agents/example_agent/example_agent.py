import random
from typing import override

from aegis import (
    END_TURN,
    MOVE,
    MOVE_RESULT,
    SAVE_SURV,
    SAVE_SURV_RESULT,
    AgentCommand,
    Direction,
    Grid,
    SurroundInfo,
    Survivor,
    SurvivorInfo,
    WorldObjectInfo,
)
from agent import BaseAgent, Brain, LogLevels


class ExampleAgent(Brain):
    def __init__(self) -> None:
        super().__init__()
        self._agent = BaseAgent.get_base_agent()
        self._list: list[AgentCommand] = []
        self._list.append(SLEEP())
        self._list.append(OBSERVE(Location(2, 2)))
        self._list.append(SAVE_SURV())
        self._list.append(TEAM_DIG())
        self._list.append(MOVE(Direction.SOUTH_EAST))
        self._list.append(SEND_MESSAGE(AgentIDList(), "This is a test"))

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
    def handle_fwd_message(self, msg: FWD_MESSAGE) -> None:
        BaseAgent.log(LogLevels.Always, f"FWD MESSAGE: {msg}")
        BaseAgent.log(LogLevels.Test, f"{msg}")

    @override
    def handle_move_result(self, mr: MOVE_RESULT) -> None:
        BaseAgent.log(LogLevels.Always, f"MOVE_RESULT: {mr}")
        BaseAgent.log(LogLevels.Test, f"{mr}")

    @override
    def handle_observe_result(self, ovr: OBSERVE_RESULT) -> None:
        BaseAgent.log(LogLevels.Always, f"OBSERVER_RESULT: {ovr}")
        BaseAgent.log(LogLevels.Always, f"{ovr.energy_level}")
        BaseAgent.log(LogLevels.Always, f"{ovr.life_signals}")
        BaseAgent.log(LogLevels.Always, f"{ovr.grid_info}")
        BaseAgent.log(LogLevels.Test, f"{ovr}")

    @override
    def handle_save_surv_result(self, ssr: SAVE_SURV_RESULT) -> None:
        BaseAgent.log(LogLevels.Always, f"SAVE_SURV_RESULT: {ssr}")
        BaseAgent.log(LogLevels.Test, f"{ssr}")

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
        BaseAgent.log(LogLevels.Test, f"{tdr}")

    @override
    def think(self) -> None:
        BaseAgent.log(LogLevels.Always, "Thinking")
        command = self._list[self._round % len(self._list)]
        if isinstance(command, SEND_MESSAGE):
            if not (command.agent_id_list):
                command.agent_id_list.add(AgentID(0, self._agent.get_agent_id().gid))

        # Send a Direction.CENTER to get surrounding info to start pathfinding.
        if self._agent.get_round_number() == 1:
            self.send_and_end_turn(MOVE(Direction.CENTER))
            return

        world = self.get_world()
        if world is None:
            self.send_and_end_turn(MOVE(Direction.CENTER))
            return

        grid = world.get_grid_at(self._agent.get_location())
        if grid is None:
            self.send_and_end_turn(MOVE(Direction.CENTER))
            return

        top_layer = grid.get_top_layer()
        if top_layer:
            self.send_and_end_turn(SAVE_SURV())
            return

        # Move north by default.
        self.send_and_end_turn(MOVE(Direction.NORTH))

    def send_and_end_turn(self, command):
        """Send a command and end your turn."""
        BaseAgent.log(LogLevels.Always, f"SENDING {command}")
        self._agent.send(command)
        self._agent.send(END_TURN())

    def update_surround(self, surround_info):
        """Updates the current and surrounding grid cells of the agent."""
        world = self.get_world()
        if world is None:
            return

        for dir in Direction:
            grid_info = surround_info.get_surround_info(dir)
            if grid_info is None:
                continue

            grid = world.get_grid_at(grid_info.location)
            if grid is None:
                continue

            grid.move_cost = grid_info.move_cost
            self.update_top_layer(grid, grid_info.top_layer_info)

    def update_top_layer(self, grid, top_layer):
        """Updates the top layer of the grid. Converting WorldObjectInfo to WorldObject"""
        if isinstance(top_layer, SurvivorInfo):
            layer = Survivor(
                top_layer.id,
                top_layer.energy_level,
                top_layer.damage_factor,
                top_layer.body_mass,
                top_layer.mental_state,
            )
            grid.set_top_layer(layer)
