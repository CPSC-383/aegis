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
)
from agent import BaseAgent, Brain, AgentController


class ExampleAgent(Brain):
    def __init__(self) -> None:
        super().__init__()
        self._agent: AgentController = BaseAgent.get_agent()

    @override
    def think(self) -> None:
        self._agent.log("Thinking")

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

        self._agent.log("THIS WORKS AAAAHHHHH")

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
        self._agent.log(f"SENDING {command}")
        self._agent.send(command)
        self._agent.send(END_TURN())
