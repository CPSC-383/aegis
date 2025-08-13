"""
Generate `aegis/stub.py` from API functions with decorators.

This script extracts only the necessary function stubs with their docstrings.
It filters functions based on enabled feature flags and writes the resulting stubs
into `aegis/stub.py`.

Designed to be run manually when updating the public-facing stub interface
based on feature flags or function changes.
"""

import ast
from importlib import resources
from pathlib import Path

from _aegis.aegis_config import has_feature
from _aegis.types.others import FeatureKey


def format_return(returns: ast.expr | None) -> str:
    """
    Format the return type annotation of a function.

    Args:
        returns (ast.expr | None): The return type node from the AST.

    Returns:
        str: The return type as a string, or empty if not specified.

    """
    if returns is None:
        return ""
    return ast.unparse(returns)


def format_args(args: ast.arguments) -> str:
    """
    Format the argument list of a function into a string.

    Args:
        args (ast.arguments): The argument list node from the AST.

    Returns:
        str: A string representation of the function arguments.

    """
    res: list[str] = []

    total_args = args.args
    defaults = args.defaults
    num_defaults = len(defaults)
    num_args = len(total_args)

    for i, arg in enumerate(total_args):
        has_default = i >= num_args - num_defaults
        default_value = defaults[i - (num_args - num_defaults)] if has_default else None

        arg_str = arg.arg
        if arg.annotation:
            arg_str += f": {ast.unparse(arg.annotation)}"
        if default_value is not None:
            arg_str += f" = {ast.unparse(default_value)}"

        res.append(arg_str)

    # *args
    if args.vararg:
        vararg_str = f"*{args.vararg.arg}"
        if args.vararg.annotation:
            vararg_str += f": {ast.unparse(args.vararg.annotation)}"
        res.append(vararg_str)

    return ", ".join(res)


def get_feature_key(dec_node: ast.AST) -> FeatureKey | None:
    """
    Extract the feature key string from a decorator AST node if it matches a known FeatureKey.

    Args:
        dec_node (ast.AST): The decorator node to inspect, expected to be a call with a string argument.

    Returns:
        FeatureKey | None: The extracted feature key if found and valid, otherwise None.

    """
    if isinstance(dec_node, ast.Call) and dec_node.args:
        arg = dec_node.args[0]
        if isinstance(arg, ast.Constant):
            val = arg.value
            if isinstance(val, str) and val in FeatureKey.__args__:
                return val  # pyright: ignore[reportReturnType]
    return None


def should_include_function(func: ast.FunctionDef) -> bool:
    """
    Determine whether a function should be included in the stub output.

    Filters based on the feature flags and which group the function belongs to.

    Args:
        func (ast.FunctionDef): The function definition.

    Returns:
        bool: True if the function should be included, False otherwise.

    """
    for dec in func.decorator_list:
        feature_key = get_feature_key(dec)
        if feature_key is not None and not has_feature(feature_key):
            return False
    return True


def get_all_from_init() -> list[str]:
    """Read and parse __init__.py from the `aegis` package to extract __all__."""
    try:
        source = resources.read_text("aegis", "__init__.py")
    except FileNotFoundError:
        print("Warning: __init__.py not found in src.aegis")
        return []
    except OSError as e:
        print(f"Error reading __init__.py: {e}")
        return []

    tree = ast.parse(source)
    for node in tree.body:
        if not isinstance(node, ast.Assign):
            continue

        for target in node.targets:
            if not (isinstance(target, ast.Name) and target.id == "__all__"):
                continue

            if not isinstance(node.value, ast.List):
                continue

            return [
                elt.value
                for elt in node.value.elts
                if isinstance(elt, ast.Constant)
                and isinstance(elt.value, str)
                and elt.value != "main"
            ]

    print("Warning: __all__ not found in __init__.py")
    return []


def build_header(funcs: list[ast.FunctionDef]) -> str:
    """
    Generate the import/header section for the stub file.

    Returns:
        str: The header string to be prepended to the stub.

    """
    needs_numpy = any("predict" in node.name for node in funcs)
    needs_messages = any("message" in node.name for node in funcs)

    imports: list[str] = []
    if needs_numpy:
        imports.extend(["import numpy as np", "from numpy.typing import NDArray"])

    rel_imports = get_all_from_init()

    if not needs_messages:
        rel_imports.remove("Message")

    rel_imports.sort()

    import_block_lines: list[str] = []
    import_block_lines.extend(imports)
    import_block_lines.append("\nfrom . import (")
    import_block_lines.extend(f"    {name}," for name in rel_imports)
    import_block_lines.append(")\n\n")
    import_block = "\n".join(import_block_lines)

    return f'''"""
Autogenerated from API functions.

Do not modify manually.
"""
# ruff: noqa: F401
# pyright: reportReturnType=false
# pyright: reportUnusedImport=false
# pyright: reportUnusedParameter=false

{import_block}
'''


def generate_stub() -> None:
    """Generate the stub file from decorated API functions."""
    try:
        source = resources.read_text("_aegis.api", "core.py")
    except FileNotFoundError:
        print("Error: `_aegis/api/core.py` not found.")
        return
    except OSError as e:
        print(f"I/O error while reading core.py: {e}")
        return

    tree = ast.parse(source)
    funcs = [
        node
        for node in tree.body
        if isinstance(node, ast.FunctionDef) and should_include_function(node)
    ]

    header = build_header(funcs)

    stubs: list[str] = []
    for i, node in enumerate(funcs):
        docstring = ast.get_docstring(node)
        signature = f"def {node.name}({format_args(node.args)}) -> {format_return(node.returns)}:"

        stub = signature
        if docstring:
            lines = docstring.splitlines()
            if len(lines) == 1:
                # single line docstring
                stub += f'\n{" " * 4}"""{lines[0]}"""'
            else:
                # multi-line docstring
                indented_lines = "\n".join(
                    f"    {line}" if line.strip() else "" for line in lines
                )
                stub += f'\n{" " * 4}"""\n{indented_lines}\n\n{" " * 4}"""'

        if i != len(funcs) - 1:
            stub += "\n"

        stubs.append(stub)

    content = header + "\n\n".join(stubs) + "\n"
    output_path = Path(__file__).parent.parent.parent / "aegis" / "stub.py"
    try:
        _ = output_path.write_text(content, encoding="utf-8")
        print(f"Successfully generated stub with {len(funcs)} functions")
    except (OSError, PermissionError) as e:
        print(f"Error writing stub.py: {e}")
