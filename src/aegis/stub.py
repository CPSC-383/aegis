"""Stub functions for agent interaction with the Aegis environment."""
# pyright: reportUnusedParameter = false
# pyright: reportUnusedImport = false
# pyright: reportReturnType = false
# ruff: noqa: F401

from . import (
    AgentCommand,
    CellInfo,
    Direction,
    Location,
    Move,
    Observe,
    ObserveResult,
    Save,
    SaveResult,
    SendMessage,
    SendMessageResult,
    Survivor,
)


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


def send(command: AgentCommand) -> None:
    """
    Send a command to Aegis for execution.

    Args:
        command: The command the agent wishes to execute.

    """


def on_map(loc: Location) -> bool:
    """
    Check whether a location is within the bounds of the world.

    Args:
        loc: The location to check.

    Returns:
        `True` if the location is on the map, `False` otherwise.

    """


def get_cell_info_at(loc: Location) -> CellInfo | None:
    """
    Return the cell info at a given location.

    Args:
        loc: The location to query.

    Returns:
        The `Cell` at the specified location, or `None` if out of bounds.

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
    """Log a message to the console."""
