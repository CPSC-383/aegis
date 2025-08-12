from collections.abc import Callable
from typing import Any, TypeVar

F = TypeVar("F", bound=Callable[..., Any])  # pyright: ignore[reportExplicitAny]


def require_feature(feature: str, group: str) -> Callable[[F], F]:
    """Create a decorator that marks a function as requiring a specific feature."""

    def decorator(func: F) -> F:
        func.requires_feature = feature  # pyright: ignore[reportFunctionMemberAccess]
        func.feature_group = group  # pyright: ignore[reportFunctionMemberAccess]
        return func

    return decorator


# Define your decorators with one line each
requires_predictions = require_feature("ALLOW_AGENT_PREDICTIONS", "predictions")
requires_messages = require_feature("ALLOW_AGENT_MESSAGES", "messages")
requires_spawning = require_feature("ALLOW_DYNAMIC_SPAWNING", "spawning")
requires_drone_scan = require_feature("ALLOW_DRONE_SCAN", "drone")
