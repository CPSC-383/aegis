from enum import Enum


class LogLevels(Enum):
    """Enum representing the different log levels."""

    Always = 1
    """Log all messages, always, regardless of the base agent log level."""

    All = 2
    """Log all messages."""

    Test = 3
    """Log messages used for testing purposes."""

    Error = 5
    """Log messages prefixed with 'ERROR'."""

    Warning = 6
    """Log messages prefixed with 'WARNING'."""

    State_Changes = 7
    """Log messages related to changes in state."""

    Nothing = 8
    """Do not log any messages."""
