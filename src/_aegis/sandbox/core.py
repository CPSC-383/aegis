# pyright: reportMissingTypeStubs = false
# pyright: reportUnknownMemberType = false
import builtins as py_builtins
import traceback
import types
from collections.abc import Callable, Mapping, Sequence
from typing import Any

from RestrictedPython import (
    Guards,
    limited_builtins,  # pyright: ignore[reportUnknownVariableType]
    safe_builtins,  # pyright: ignore[reportUnknownVariableType]
)

from _aegis.types import MethodDict

from .sandbox import Sandbox


class LumenCore:
    def __init__(
        self, code: Sandbox, methods: MethodDict, error: Callable[..., None]
    ) -> None:
        self.error: Callable[..., None] = error
        self.code: Sandbox = code
        self.allowed_modules: set[str] = {
            "os",
            "pathlib",
            "random",
            "heapq",
            "math",
            "json",
            "re",
            "enum",
            "numpy",
            "tensorflow",
            "tf",
        }

        builtins: MethodDict = {}
        namespace = {}
        builtins.update({**safe_builtins, **limited_builtins, **methods})  # pyright: ignore[reportUnknownArgumentType]
        for name in [
            "all",
            "any",
            "list",
            "dict",
            "set",
            "tuple",
            "enumerate",
            "reversed",
            "max",
            "min",
            "sum",
        ]:
            builtins[name] = getattr(py_builtins, name)
        builtins["__import__"] = self.custom_import
        namespace.update(
            {
                "_getattr_": self.deny_private_attr,
                "_getitem_": self.deny_private_items,
                "_getiter_": self.default_guarded_iter,
                "_write_": self.default_guarded_write,
                "__metaclass__": type,
                "_unpack_sequence_": Guards.guarded_unpack_sequence,
                "_iter_unpack_sequence_": Guards.guarded_iter_unpack_sequence,
            }
        )

        namespace["__builtins__"] = builtins
        namespace["__name__"] = "__main__"

        self.namespace: dict[str, object] = namespace

    def default_guarded_iter(self, ob: object) -> object:
        return ob

    def default_guarded_write(self, ob: object) -> object:
        return ob

    def custom_import(
        self,
        name: str,
        globals_: Mapping[str, object] | None = None,
        locals_: Mapping[str, object] | None = None,
        fromlist: Sequence[str] = (),
        level: int = 0,
    ) -> types.ModuleType:
        if not (isinstance(fromlist, tuple)):
            error = "Invalid import name"
            raise TypeError(error)
        if level != 0:
            error = f"Relative imports not allowed: {name}"
            raise ImportError(error)
        if name.startswith("_") or name not in self.allowed_modules:
            error = f"Import of module '{name}' is not allowed"
            raise ImportError(error)
        return __import__(name, globals_, locals_, fromlist, level)  # pyright: ignore[reportAny]

    @staticmethod
    def deny_private_attr(obj: object, attr: str) -> object:
        if attr.startswith("_"):
            error = f"Access to private attribute '{attr}' is denied."
            raise AttributeError(error)
        return getattr(obj, attr)  # pyright: ignore[reportAny]

    @staticmethod
    def deny_private_items(obj: Mapping[Any, Any], item: object) -> object:  # pyright: ignore[reportExplicitAny]
        if isinstance(item, str) and len(item) > 0 and item[0] == "_":
            error = f"Access to private key '{item}' is denied."
            raise KeyError(error)

        return obj[item]  # pyright: ignore[reportAny]

    def init(self) -> None:
        try:
            exec(self.code["main"], self.namespace)  # noqa: S102
        except Exception:  # noqa: BLE001
            self.error(traceback.format_exc(limit=5))

    def think(self) -> None:
        if "think" not in self.namespace or not callable(self.namespace.get("think")):
            self.error("Think doesn't exist")
            return

        try:
            self.namespace["think"]()  # pyright: ignore[reportCallIssue]
        except Exception:  # noqa: BLE001
            self.error(traceback.format_exc(limit=5))
