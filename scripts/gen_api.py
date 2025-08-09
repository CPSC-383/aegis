"""
Script to auto generate api docs for the documentation website.

It parses the `full_stub.py` file and the other hardocoded class in this file.
"""
# pyright: reportExplicitAny = false
# pyright: reportAny = false

import json
import re
from pathlib import Path
from typing import Any, TypedDict

import griffe

PACKAGE = griffe.load("_aegis")
STUB: griffe.Module = PACKAGE["full_stub"]


##########################################
#                Types                   #
##########################################


class AttrInfo(TypedDict):
    """Represents an attribute of a class."""

    name: str
    annotation: str
    docstring: str | None
    default: Any


class ParamInfo(TypedDict):
    """Represents a parameter of a function."""

    name: str
    annotation: str
    default: Any


class FuncInfo(TypedDict):
    """Represents a function's signature information."""

    name: str
    params: list[ParamInfo]
    return_: str
    docstring: str | None


class ClassDetails(TypedDict):
    """Represents a class' signature information."""

    functions: dict[str, FuncInfo]
    attributes: list[AttrInfo]


##########################################
#           Util functions               #
##########################################


def sanitize_for_json(obj: object) -> ...:
    """
    Recursively convert a Python object into JSON-serializable types.

    Args:
        obj (object): The input object to sanitize for JSON serialization.

    Returns:
        Any: A JSON-serializable representation of the input object.
            Basic types (str, int, float, bool, None) are returned as is.
            dict, list, and tuple are recursively sanitized.
            Other types are converted to their string representation.

    """
    if isinstance(obj, (str, int, float, bool)) or obj is None:
        return obj
    if isinstance(obj, dict):
        return {k: sanitize_for_json(v) for k, v in obj.items()}  # pyright: ignore[reportUnknownVariableType, reportUnknownArgumentType]
    if isinstance(obj, (list, tuple)):
        return [sanitize_for_json(i) for i in obj]  # pyright: ignore[reportUnknownVariableType, reportUnknownArgumentType]
    return str(obj)


def save_api_docs_json(output_path: Path) -> None:
    """
    Save the parsed API documentation data to a JSON file.

    Args:
        output_path (Path): The path to the JSON file to write.

    This includes stub functions, imported classes' functions, and attributes.

    """
    stub_functions = parse_functions(STUB.functions)
    imported_names = find_imported_names()
    mod_sigs = parse_imported_classes(imported_names)

    full_data = {
        "stub_functions": stub_functions,
        "modules": mod_sigs,
    }

    sanitized = sanitize_for_json(full_data)

    with output_path.open("w", encoding="utf-8") as f:
        json.dump(sanitized, f, indent=2)


def print_attributes(attributes: list[AttrInfo]) -> None:
    """
    Print a summary of attributes with their types and docstring presence.

    Args:
        attributes (list[AttrInfo]): A list of attribute details, each including
            the attribute name, type annotation, default value, and optionally docstring content.

    Output Format:
        - attr_name [doc: yes/no]: type: annotation, default: value (if present)

    """
    for attr in attributes:
        doc_present = "yes" if attr.get("docstring") else "no"
        default_str = (
            f", default: {attr['default']}" if attr.get("default") is not None else ""
        )
        print(
            f"- {attr['name']} [doc: {doc_present}]: type: {attr['annotation']}{default_str}"
        )


def print_functions(functions: dict[str, FuncInfo]) -> None:
    """
    Print a summary of functions with their return types, parameters, and docstring presence.

    Args:
        functions (dict[str, FuncInfo]): A dictionary mapping function names to their
            signature information, including parameters, return annotation, defaults,
            and optionally docstring content.

    Output Format:
        - function_name [doc: yes/no]: returns return_type, args: [param1:type1 = default1, ...]

    """
    for fname, finfo in functions.items():
        doc_present = "yes" if finfo.get("docstring") else "no"
        print(
            f"- {fname} [doc: {doc_present}]: returns {finfo['return_']}, args: ["
            + ", ".join(
                f"{p['name']}:{p['annotation']}"
                + (f" = {p['default']}" if p["default"] is not None else "")
                for p in finfo["params"]
            )
            + "]"
        )


def pascal_to_snake(name: str) -> str:
    """Convert PascalCase string to snake_case."""
    s1 = re.sub("(.)([A-Z][a-z]+)", r"\1_\2", name)
    s2 = re.sub("([a-z0-9])([A-Z])", r"\1_\2", s1)
    return s2.lower()


##########################################
#           Parse functions              #
##########################################


def parse_attributes(attrs: dict[str, griffe.Attribute]) -> list[AttrInfo]:
    """
    Parse class attributes.

    Args:
        attrs: Dictionary of attribute names to Griffe Attribute objects.

    Returns:
        A list of attribute info dictionaries.

    """
    results: list[AttrInfo] = []
    for attr in attrs.values():
        # Skip private ones
        if attr.name.startswith("_"):
            continue

        results.append(
            {
                "name": attr.name,
                "annotation": str(attr.annotation) if attr.annotation else "",
                "docstring": attr.docstring.value if attr.docstring else None,
                "default": attr.value,
            }
        )
    return results


def parse_functions(funcs: dict[str, griffe.Function]) -> dict[str, FuncInfo]:
    """
    Parse a collection of Griffe Function objects to extract detailed function signature information.

    Args:
        funcs (dict[str, griffe.Function]): A dictionary of function names to Griffe Function objects.

    Returns:
        dict[str, FuncInfo]: A dictionary mapping function names to their parsed signature details,
            including parameter names, annotations, default values, return type, and docstring.

    """
    functions: dict[str, FuncInfo] = {}

    for func in funcs.values():
        func_info: FuncInfo = {
            "name": func.name,
            "params": [],
            "return_": str(func.returns),
            "docstring": func.docstring.value if func.docstring else None,
        }
        for param in func.parameters:
            func_info["params"].append(
                {
                    "name": param.name,
                    "annotation": str(param.annotation),
                    "default": param.default,
                }
            )
        functions[func.name] = func_info
    return functions


def find_imported_names() -> list[str]:
    """
    Extract imported class names from the stub file.

    Searches the stub file for an import statement of the form:
        from . import (
            ClassName1,
            ClassName2,
            ...
        )
    and returns the imported names as a list of strings.

    Returns:
        list[str]: A list of imported class names found in the stub file.
                   Returns an empty list if no matching import block is found.

    """
    pattern = re.compile(r"from\s+\.\s+import\s*\((.*?)\)", re.DOTALL)
    stub_path = Path(str(STUB.filepath))
    with stub_path.open() as f:
        content = f.read()

    match = pattern.search(content)
    if not match:
        return []

    imports_raw = match.group(1)
    return [
        name.strip().split(",")[0] for name in imports_raw.splitlines() if name.strip()
    ]


def parse_imported_classes(imported_names: list[str]) -> dict[str, ClassDetails]:
    """
    Parse functions from source files corresponding to imported class names.

    Given a list of imported class names, locate their source files under the root
    directory and the 'common' subdirectories, parse their functions, and return
    a mapping from class name to its parsed function signatures.

    Args:
        imported_names (List[str]): List of class names to locate and parse.

    Returns:
        dict[str, dict[str, FuncInfo]]:
            A dictionary mapping each class name to another dictionary that maps
            function names to their parsed signature details.

    """
    classes: dict[str, ClassDetails] = {}
    root_dir = Path(str(STUB.filepath)).parent
    common_dir = root_dir / "common"
    candidate_dirs = [root_dir, common_dir]
    if common_dir.is_dir():
        candidate_dirs.extend(
            p for p in common_dir.iterdir() if p.is_dir() and p.name != "__pycache__"
        )

    for name in imported_names:
        module_path = None
        for directory in candidate_dirs:
            filename = pascal_to_snake(name) + ".py"
            candidate = directory / filename
            if candidate.is_file():
                module_path = candidate
                break

        if module_path is None:
            print(f"Warning: Could not find file for imported name '{name}'")
            continue
        try:
            rel_path = module_path.relative_to(root_dir)
        except ValueError:
            print(f"Warning: Could not make import path for '{module_path}'")
            continue

        import_path = str(rel_path.with_suffix("")).replace("/", ".")
        module: griffe.Module = PACKAGE[import_path]
        cls = module.classes.get(name)
        if cls is None:
            print(f"Warning: Class '{name}' not found in {import_path}")
            continue

        funcs = parse_functions(cls.functions)
        attrs = parse_attributes(cls.attributes)
        classes[name] = {"functions": funcs, "attributes": attrs}

    return classes


def main() -> None:
    """
    Entry point for analyzing the stub file and its imported classes.

    Output is printed to the console for inspection.
    """
    stub_functions = parse_functions(STUB.functions)

    print("\nFunctions in stub file:")
    print_functions(stub_functions)

    imported_names = find_imported_names()
    print(f"\nImported names from stub: {imported_names}")

    mod_sigs = parse_imported_classes(imported_names)
    for mod_name, mod_info in mod_sigs.items():
        print(f"Module: {mod_name}")
        print_functions(mod_info["functions"])
        attrs = mod_info["attributes"]
        print("--- Attributes ---")
        print_attributes(attrs)

    save_api_docs_json(Path("api_docs.json"))
    print("\nAPI docs saved to api_docs.json")


if __name__ == "__main__":
    main()
