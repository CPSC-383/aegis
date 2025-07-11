from functools import wraps
from typing import Callable, ParamSpec, TypeVar

P = ParamSpec("P")
R = TypeVar("R")


def disabled_if(
    flag: bool, reason: str = "Feature disabled"
) -> Callable[[Callable[P, R]], Callable[P, R]]:
    """
    Decorator to disable a function based on a runtime feature flag.

    Args:
        flag (bool): If False, the decorated function raises a RuntimeError.
        reason (str): Error message shown when the function is disabled.

    Returns:
        Callable: A wrapped function that raises if the feature is disabled.
    """

    def decorator(fn: Callable[P, R]) -> Callable[P, R]:
        @wraps(fn)
        def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
            if not flag:
                raise RuntimeError(reason)
            return fn(*args, **kwargs)

        return wrapper

    return decorator
