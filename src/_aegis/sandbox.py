from ast import AnnAssign, ClassDef, Constant, Expr, Str
import re
from pathlib import Path
import builtins as py_builtins
from typing import override

from RestrictedPython import (
    Guards,
    RestrictingNodeTransformer,
    compile_restricted,
    limited_builtins,
    safe_builtins,
)

class NodeTransformer(RestrictingNodeTransformer):
    def doc_str(self, node):
        if isinstance(node, Expr):
            if isinstance(node.value, Constant) and isinstance(node.value.value, str):
                return node.value.value
            elif isinstance(node.value, Str):
                return str(node.value.s)
        return None

    def get_descriptions(self, body):
        doc_strings = {}
        current_name = None
        for node in body:
            if isinstance(node, AnnAssign) and isinstance(node.target, Name):
                current_name = node.target.id
                continue
            elif current_name and self.doc_str(node):
                doc_strings[current_name] = self.doc_str(node)
            current_name = None
        return doc_strings

    @override
    def visit_AnnAssign(self, node: AnnAssign):
        return self.node_contents_visit(node) 

    def visit_TypeAlias(self, node):
        return self.node_contents_visit(node)

    def visit_TypeVar(self, node):
        return self.node_contents_visit(node)

    def visit_TypeVarTuple(self, node):
        return self.node_contents_visit(node)

    def visit_ParamSpec(self, node):
        return self.node_contents_visit(node)

    def visit_ClassDef(self, node: ClassDef):
        # find attribute docs in this class definition
        doc_strings = self.get_descriptions(node.body)
        self.used_names[node.name + ":doc_strings"] = doc_strings
        return super().visit_ClassDef(node)


class Sandbox:
    def __init__(self, methods) -> None:
        self.byte_code = None
        self.allowed_modules = {"os", "pathlib", "random", "heapq", "math", "json", "re", "enum", "numpy", "tensorflow", "tf"}

        builtins = {}
        namespace = {}
        builtins.update({**safe_builtins, **limited_builtins, **methods})
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
        builtins["__import__"] = self._custom_import
        namespace.update({
            "_getattr_": self._deny_private_attr,
            "_getitem_": self._deny_private_items,
            "_getiter_": lambda i: i,
            "__metaclass__": type,
            "_write_": self._default_guarded_write,
            "_unpack_sequence_": Guards.guarded_unpack_sequence,
            "_iter_unpack_sequence_": Guards.guarded_iter_unpack_sequence,
        })

        namespace["__builtins__"] = builtins
        namespace["__name__"] = "__main__"

        self.namespace = namespace

    def _default_guarded_write(self, ob):
        return ob

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
    def _deny_private_attr(obj, attr):
        if isinstance(attr, str) and attr.startswith("_"):
            raise AttributeError(f"Access to private attribute '{attr}' is denied.")
        return getattr(obj, attr)

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

        byte_code = compile_restricted(code, filename=str(path), mode="exec", policy=NodeTransformer)
        if byte_code is None:
            error = f"Could not compile agent at {path}"
            raise ImportError(error)
        self.byte_code = byte_code

    def init(self):
        if self.byte_code is None:
            error = "Sandbox byte_code is not compiled. Call load_and_compile() first."
            raise RuntimeError(error)
        exec(self.byte_code, self.namespace)

    def has_think(self) -> bool:
        return callable(self.namespace.get("think"))

    def has_handle_save(self) -> bool:
        return callable(self.namespace.get("handle_save"))

    def has_handle_messages(self) -> bool:
        return callable(self.namespace.get("handle_messages"))

    def has_handle_observe(self) -> bool:
        return callable(self.namespace.get("handle_observe"))

    def think(self):
        func = self.namespace.get("think")
        if callable(func):
            return func()
        error = "Agent has no callable 'think' function."
        raise RuntimeError(error)

    def handle_save(self, *args, **kwargs) -> None:
        func = self.namespace.get("handle_save")
        if callable(func):
            func(*args, **kwargs)

    def handle_messages(self, *args, **kwargs) -> None:
        func = self.namespace.get("handle_messages")
        if callable(func):
            func(*args, **kwargs)

    def handle_observe(self, *args, **kwargs) -> None:
        func = self.namespace.get("handle_observe")
        if callable(func):
            func(*args, **kwargs)
