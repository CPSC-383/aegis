from aegis import (
    MOVE,
    OBSERVE_RESULT,
    SAVE,
    SAVE_RESULT,
    SEND_MESSAGE,
    Agent,
    Direction,
    Survivor,
)


def handle_messages(agent: Agent, messages: list[SEND_MESSAGE]) -> None:
    """
    Function to handle incoming messages.
    This is called before `think()` and the other `handle_*()` functions if there are messages to process.
    """
    for message in messages:
        agent.log(f"Received Message: {message}")


def handle_observe(agent: Agent, ovr: OBSERVE_RESULT) -> None:
    """
    Function to handle observe result.
    This is called after `handle_messages()` and before `think()` if there are results to process.
    """
    agent.log(f"OVR: {ovr}")


def handle_save(agent: Agent, svr: SAVE_RESULT) -> None:
    """
    Function to handle survivor result.
    This is called after `handle_messages()` and before `think()` if there are results to process.
    """
    agent.log(f"SVR: {svr}")


def think(agent: Agent) -> None:
    """
    This function must be defined.
    This is called after `handle_messages()` and the result functions.
    """
    agent.log("Thinking")

    # On the first round, send a request for surrounding information
    # by moving to the center (not moving). This will help initiate pathfinding.
    if agent.get_round_number() == 1:
        agent.send(MOVE(Direction.CENTER))
        return

    # Retrieve the current state of the world.
    world = agent.get_world()
    if world is None:
        agent.send(MOVE(Direction.CENTER))
        return

    # Fetch the cell at the agent’s current location. If the location is outside the world’s bounds,
    # return a default move action and end the turn.
    cell = world.get_cell_at(agent.get_location())
    if cell is None:
        agent.send(MOVE(Direction.CENTER))
        return

    # Get the top layer at the agent’s current location.
    # If a survivor is present, save it and end the turn.
    top_layer = cell.get_top_layer()
    if isinstance(top_layer, Survivor):
        agent.send(SAVE())
        return

    # Default action: Move the agent north if no other specific conditions are met.
    agent.send(MOVE(Direction.NORTH))
