from collections.abc import Callable
from typing import TypeVar

from _aegis.types.others import FeatureKey

F = TypeVar("F", bound=Callable[..., object])


def requires(_feature_key: FeatureKey) -> Callable[[F], F]:
    def decorator(func: F) -> F:
        return func

    return decorator
