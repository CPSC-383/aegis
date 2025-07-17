# ruff: noqa: F403 F405, INP001, D100
from aegis.stub import *


def handle_messages(messages: list[SendMessageResult]) -> None:
    """
    Handle incoming messages.

    This is called before `think()` and the other `handle_*()` functions
    if there are messages to process.
    """
    for message in messages:
        log(f"Received Message: {message}")


def handle_observe(ovr: ObserveResult) -> None:
    """
    Handle observe result.

    This is called after `handle_messages()` and before `think()`
    if there are results to process.
    """
    log(f"OVR: {ovr}")


def handle_save(svr: SaveResult) -> None:
    """
    Handle survivor result.

    This is called after `handle_messages()` and before `think()`
    if there are results to process.
    """
    log(f"SVR: {svr}")


def think() -> None:
    """Do not remove this function, it must always be defined."""
    log("Thinking")

    # On the first round, send a request for surrounding information
    # by moving to the center (not moving). This will help initiate pathfinding.
    if get_round_number() == 1:
        send(Move(Direction.CENTER))
        send(SendMessage([], "hello world"))
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
