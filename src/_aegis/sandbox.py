import re
from pathlib import Path
import builtins as py_builtins

from RestrictedPython import (
    Guards,
    compile_restricted,
    limited_builtins,
    safe_builtins,
)


class Sandbox:
    def __init__(self, methods) -> None:
        self.byte_code = None
        self.allowed_modules = {"random", "heapq", "math", "json", "enum", "numpy", "re"}
        self.methods = methods
        self.globals = self._create_globals()

    def _create_globals(self):
        builtins = dict(i for d in [safe_builtins, limited_builtins] for i in d.items())
        builtins.update({
            "list": py_builtins.list,
            "dict": py_builtins.dict,
            "tuple": py_builtins.tuple,
            "set": py_builtins.set,
            "enumerate": py_builtins.enumerate,
        })
        builtins.update({
            "_getiter_": lambda i: i,
            "_getitem_": self._deny_private_items,
                "enumerate": enumerate,
                "set": set,
            "__import__": self._custom_import,
            "_unpack_sequence_": Guards.guarded_unpack_sequence,
            "_iter_unpack_sequence_": Guards.guarded_iter_unpack_sequence,
            **self.methods,
        })
        return {
            "__builtins__": builtins,
            "__name__": "__main__",
        }

    def _custom_import(self, name, globals=None, locals=None, fromlist=(), level=0):
        if not isinstance(name, str) or not (
            isinstance(fromlist, tuple) or fromlist is None
        ):
            error = "Invalid import name"
            raise ImportError(error)
        if level != 0:
            error = f"Relative imports not allowed: {name}"
            raise ImportError(error)
        if name not in self.allowed_modules:
            error = f"Import of module '{name}' is not allowed"
            raise ImportError(error)
        return __import__(name, globals, locals, fromlist, level)

    @staticmethod
    def _deny_private_items(obj, item):
        if isinstance(item, str) and len(item) > 0:
            if item[0] == "_":
                error = f"Access to private key '{item}' is denied."
                raise KeyError(error)

        return obj[item]

    def load_and_compile(self, path: Path):
        code = path.read_text(encoding="utf-8")
        code = re.sub(
            r"^.*from\s+aegis\.stub\s+import.*(\n|\r|\r\n)?",
            "",
            code,
            flags=re.MULTILINE,
        )

        byte_code = compile_restricted(code, filename=str(path), mode="exec")
        if byte_code is None:
            error = f"Could not compile agent at {path}"
            raise ImportError(error)
        self.byte_code = byte_code

    def init(self):
        if self.byte_code is None:
            error = "Sandbox byte_code is not compiled. Call load_and_compile() first."
            raise RuntimeError(error)
        exec(self.byte_code, self.globals)

    def has_think(self) -> bool:
        return callable(self.globals.get("think"))

    def has_handle_save(self) -> bool:
        return callable(self.globals.get("handle_save"))

    def has_handle_messages(self) -> bool:
        print(f"HAS: {callable(self.globals.get("handle_messages"))}")
        return callable(self.globals.get("handle_messages"))

    def has_handle_observe(self) -> bool:
        return callable(self.globals.get("handle_observe"))

    def think(self):
        func = self.globals.get("think")
        if callable(func):
            return func()
        error = "Agent has no callable 'think' function."
        raise RuntimeError(error)

    def handle_save(self, *args, **kwargs) -> None:
        func = self.globals.get("handle_save")
        if callable(func):
            func(*args, **kwargs)

    def handle_messages(self, *args, **kwargs) -> None:
        func = self.globals.get("handle_messages")
        if callable(func):
            func(*args, **kwargs)

    def handle_observe(self, *args, **kwargs) -> None:
        func = self.globals.get("handle_observe")
        if callable(func):
            func(*args, **kwargs)
