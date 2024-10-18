from typing import override

from aegis import (
    CONNECT_OK,
    END_TURN,
    FWD_MESSAGE,
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
)
from agent import BaseAgent, Brain, LogLevels


class ExampleAgent(Brain):
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
        BaseAgent.log(LogLevels.Always, f"{ovr.cell_info}")
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

        # On the first round, send a request for surrounding information
        # by moving to the center (not moving). This will help initiate pathfinding.
        if self._agent.get_round_number() == 1:
            self.send_and_end_turn(MOVE(Direction.CENTER))
            return

        # Retrieve the current state of the world.
        world = self.get_world()
        if world is None:
            self.send_and_end_turn(MOVE(Direction.CENTER))
            return

        # Fetch the cell at the agent’s current location. If the location is outside the world’s bounds,
        # return a default move action and end the turn.
        cell = world.get_cell_at(self._agent.get_location())
        if cell is None:
            self.send_and_end_turn(MOVE(Direction.CENTER))
            return

        # Get the top layer at the agent’s current location.
        # If a survivor is present, save it and end the turn.
        top_layer = cell.get_top_layer()
        if isinstance(top_layer, Survivor):
            self.send_and_end_turn(SAVE_SURV())
            return

        # Default action: Move the agent north if no other specific conditions are met.
        self.send_and_end_turn(MOVE(Direction.NORTH))

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
