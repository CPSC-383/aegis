# pyright: basic

from functools import wraps
from importlib.util import find_spec
from typing import Callable, TypeVar, Type, Any, Union, cast
import inspect

F = TypeVar("F", bound=Callable[..., Any])
C = TypeVar("C", bound=Type[Any])


def depends_on_optional(module_name: str) -> Callable[[Union[F, C]], Union[F, C]]:
    def decorator(obj: Union[F, C]) -> Union[F, C]:
        spec = find_spec(module_name)
        if spec is None:
            name = obj.__name__
            raise ImportError(f"Optional dependency {module_name} not found ({name}).")

        if inspect.isfunction(obj):

            @wraps(obj)
            def wrapper(*args: Any, **kwargs: Any) -> Any:
                return obj(*args, **kwargs)

            return cast(F, wrapper)

        elif inspect.isclass(obj):
            return cast(C, obj)

        raise TypeError("depends_on_optional can only be used on functions or classes.")

    return decorator
