"""
DO NOT IMPORT THIS FILE.

This file contains all possible agent stub functions and is used by the stub generator
to produce the public-facing `aegis/stub.py`.

It is NOT part of the runtime API.
"""


def get_round_number() -> int:
    """Return the current round number."""


def get_id() -> int:
    """Return the id of the current agent."""


def get_team() -> int:
    """Return the current team of the agent."""


def get_location() -> Location:
    """Return the current location of the agent."""


def get_energy_level() -> int:
    """Return the current energy level of the agent."""


def move(direction: Direction) -> None:
    """
    Move the agent in the specified direction.

    Args:
        direction (Direction): The direction in which the agent should move.

    """


def save() -> None:
    """Save a survivor."""


def dig() -> None:
    """Dig rubble."""


def recharge() -> None:
    """
    Recharge the agent's energy.

    This function only works if the agent is currently on a charging cell.
    """


def predict(surv_id: int, label: np.int32) -> None:
    """
    Submit a prediction.

    Args:
        surv_id (int): The unique ID of the survivor.
        label (int): The predicted label/classification for the survivor.

    """


def send_message(message: str, dest_ids: list[int]) -> None:
    """
    Send a message to specified destination agents on the same team, excluding self.

    Args:
        message (str): The content of the message to send.
        dest_ids (list[int]): List of agent IDs to send the message to. If empty, message is broadcast to team excluding self.

    """


def read_messages(round_num: int = -1) -> list[Message]:
    """
    Retrieve messages from the message buffer.

    Args:
        round_num (int, optional): The round number to retrieve messages from.
            Defaults to -1, which returns messages from all rounds.

    Returns:
        list[Message]: List of messages.

    """


def on_map(loc: Location) -> bool:
    """
    Check whether a location is within the bounds of the world.

    Args:
        loc: The location to check.

    Returns:
        `True` if the location is on the map, `False` otherwise.

    """


def get_cell_info_at(loc: Location) -> CellInfo:
    """
    Return the cell info at a given location.

    If the location is adjacent (1 tile away) to the agent,
    or has been scanned by a drone, all layers and visible agents.

    If the location is not adjacent or hasn't been scanned, only the top layer is returned,
    and agent presence is hidden.

    Args:
        loc: The location to query.

    Returns:
        The `CellInfo` at the specified location, potentially with limited information
        depending on visibility rules.

    """


def get_survs() -> list[Location]:
    """Return a list of locations where survivors are present."""


def get_charging_cells() -> list[Location]:
    """Return a list of locations where charging cells are present."""


def get_spawns() -> list[Location]:
    """Return a list of spawn locations."""


def spawn_agent(loc: Location) -> None:
    """
    Spawn an agent.

    Args:
        loc: A valid spawn location.

    """


def log(*args: object) -> None:
    """
    Log a message.

    Args:
        *args: The message to log.

    """


def read_pending_predictions() -> list[
    tuple[int, NDArray[np.uint8], NDArray[np.int32]]
]:
    """
    Retrieve the list of pending predictions stored by the agent's team.

    Returns:
        list[tuple[int, NDArray[np.uint8], NDArray[np.int32]]]: A list of tuples representing pending survivor predictions (surv_id, image_to_predict, all_unique_labels).
            Returns an empty list if no pending predictions are available.

    """


def drone_scan(loc: Location) -> None:
    """
    Scan a location with a drone.

    Args:
        loc: The location to scan.

    """
