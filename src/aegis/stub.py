"""Stub functions for agent interaction with the Aegis environment."""
# ruff: noqa: F401
# pyright: reportReturnType=false
# pyright: reportUnusedImport=false
# pyright: reportUnusedParameter=false

from typing import Any

from _aegis.common.cell_contents import CellContents

from . import (
    AgentCommand,
    CellInfo,
    Direction,
    Location,
    Message,
    Observe,
    ObserveResult,
    Predict,
    Rubble,
    Survivor,
    SurvivorID,
)

# import the predict command if predictions are enabled
# try:
#     from . import Predict
# except ImportError:
#     pass


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

    Args:
        loc: The location to query.

    Returns:
        The `CellInfo` at the specified location.

    """


def get_cell_contents_at(loc: Location) -> CellContents | None:
    """
    Return the cell contents at a given location. This includes the layers and agents (both teams) present in the cell.

    Args:
        loc: The location to query.

    Returns:
        The `CellContents` at the specified location, or `None` if out of bounds.

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


def read_pending_predictions() -> list[tuple[SurvivorID, Any, Any]]:
    """
    Get prediction information for a survivour saved by an agent's team.

    Returns:
        List of pending predictions for the team (Empty if no pending predictions) structured as (survivor_id, image, unique_labels)

    """


def drone_scan(loc: Location) -> None:
    """
    Scan a location with a drone.

    Args:
        loc: The location to scan.

    """
