from enum import Enum


class State(Enum):
    """Represents the state of the simulation."""

    IDLE = 1
    """The simulation is idle."""

    SHUT_DOWN = 2
    """The simulation is shutting down."""

    RUN_SIMULATION = 3
    """The simulation is running."""

    NONE = 4
    """No state."""
