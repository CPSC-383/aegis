# flake8: noqa F403 F405
from aegis.stub import *


def think() -> None:
    """
    This function must be defined.
    """
    log("Thinking")

    # On the first round, send a request for surrounding information
    # by moving to the center (not moving). This will help initiate pathfinding.
    if get_round_number() == 1:
        send(MOVE(Direction.CENTER))
        return

    # Retrieve the current state of the world.
    world = get_world()
    if world is None:
        send(MOVE(Direction.CENTER))
        return

    # Fetch the cell at the agent’s current location. If the location is outside the world’s bounds,
    # return a default move action and end the turn.
    cell = world.get_cell_at(get_location())
    if cell is None:
        send(MOVE(Direction.CENTER))
        return

    # Get the top layer at the agent’s current location.
    # If a survivor is present, save it and end the turn.
    top_layer = cell.get_top_layer()
    if isinstance(top_layer, Survivor):
        send(SAVE_SURV())
        return

    # Default action: Move the agent north if no other specific conditions are met.
    send(MOVE(Direction.NORTH))
