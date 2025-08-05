# ruff: noqa: F403 F405, INP001, D100
from aegis.stub import *


def think() -> None:
    """Do not remove this function, it must always be defined."""
    log("Thinking")

    cell_contents = get_cell_contents_at(get_location())

    # Get the top layer at the agent's current location.
    # If a survivor is present, save it and end the turn.
    if isinstance(cell.top_layer, Survivor):
        send(Save())
        return

    # Default action: Move the agent north if no other specific conditions are met.
    send(Move(Direction.NORTH))
