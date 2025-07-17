# ruff: noqa: F403 F405, INP001, D100
from aegis.stub import *


def think() -> None:
    """Do not remove this function, it must always be defined."""
    log("Thinking")

    # On the first round, send a request for surrounding information
    # by moving to the center (not moving). This will help initiate pathfinding.
    if get_round_number() == 1:
        send(Move(Direction.CENTER))
        return

    # Fetch the cell at the agent's current location. If the location is outside
    # the world's bounds, return a default move action and end the turn.
    cell = get_cell_at(get_location())
    if cell is None:
        send(Move(Direction.CENTER))
        return

    # Get the top layer at the agent's current location.
    # If a survivor is present, save it and end the turn.
    top_layer = cell.get_top_layer()
    if isinstance(top_layer, Survivor):
        send(Save())
        return

    # Default action: Move the agent north if no other specific conditions are met.
    send(Move(Direction.NORTH))
