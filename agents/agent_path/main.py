# ruff: noqa: F403 F405, INP001, D100
from aegis.stub import *


def think() -> None:
    """Do not remove this function, it must always be defined."""
    log("Thinking")

    cell = get_cell_info_at(get_location())
    if cell is None:
        send(Move(Direction.CENTER))
        return
    
    if get_round_number() == 2:
        drone_scan(Location(5, 9))

    # Get the top layer at the agent's current location.
    # If a survivor is present, save it and end the turn.
    if isinstance(cell.top_layer, Survivor):
        send(Save())
        return

    # Default action: Move the agent north if no other specific conditions are met.
    send(Move(Direction.NORTH))
