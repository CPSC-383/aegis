"""
Script to auto generate api docs for the documentation website.

It parses the `full_stub.py` file and gets all the informatiom from the classes and functions.
"""
# pyright: reportExplicitAny = false
# pyright: reportAny = false

import re
from pathlib import Path
from typing import Any, TypedDict

import griffe

PACKAGE = griffe.load("_aegis")
STUB: griffe.Module = PACKAGE["full_stub"]
AGENT_API_OUTPUT_PATH = Path("./docs/content/docs/api/agent.mdx")


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


class ClassInfo(TypedDict):
    """Represents a class' signature information."""

    functions: dict[str, FuncInfo]
    attributes: list[AttrInfo]


##########################################
#           Util functions               #
##########################################


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


def parse_imported_classes(imported_names: list[str]) -> dict[str, ClassInfo]:
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
    classes: dict[str, ClassInfo] = {}
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


##########################################
#           Render functions             #
##########################################


def render_param(param: ParamInfo) -> str:
    """
    Render a single function parameter as an MDX PyParameter component.

    Args:
        param (ParamInfo): A dictionary containing parameter info.

    Returns:
        str: An MDX string representing the PyParameter component for this parameter.

    """
    default = f' value="{param["default"]}"' if param.get("default") is not None else ""
    type_str = param.get("annotation") or ""
    return (
        f'<PyParameter name="{param["name"]}" type="{type_str}"{default}>\n'
        f"  {param.get('docstring', '')}\n"
        f"</PyParameter>"
    )


def render_function(name: str, func: FuncInfo) -> str:
    """
    Render a function and its parameters as an MDX PyFunction component with header.

    Args:
        name (str): The function name.
        func (FuncInfo): A dictionary with function info.

    Returns:
        str: An MDX string representing the function header, parameters,
             and return type using custom PyFunction components.

    """
    params_mdx = "\n".join(render_param(p) for p in func["params"])
    doc = func.get("docstring", "")
    ret_type = func.get("return_", "None")
    ret_doc = ""

    return (
        f"## {name}\n\n"
        f'<PyFunction docString="{doc}">\n'
        f"{params_mdx}\n"
        f'<PyFunctionReturn type="{ret_type}">\n{ret_doc}\n</PyFunctionReturn>\n'
        f"</PyFunction>"
    )


def render_stub_functions(functions: dict[str, FuncInfo]) -> str:
    """
    Render multiple stub functions into a concatenated MDX string.

    Args:
        functions (dict[str, FuncInfo]): Dictionary mapping function names to their info.

    Returns:
        str: Concatenated MDX string representing all functions.

    """
    return "\n".join(render_function(name, f) for name, f in functions.items())


def render_agent_api_docs(stub_functions: dict[str, FuncInfo]) -> str:
    """
    Generate a complete MDX document string for the Agent API docs.

    Includes frontmatter and renders all stub functions.

    Args:
        stub_functions (dict[str, FuncInfo]): Dictionary of stub functions info.

    Returns:
        str: Complete MDX document as a string.

    """
    mdx = """---
title: Agent API
description: Agent functions to interact with the world.
---\n\n
"""

    if stub_functions:
        mdx += render_stub_functions(stub_functions)
        mdx += "\n"

    return mdx


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

    agent_api_mdx = render_agent_api_docs(stub_functions)

    _ = AGENT_API_OUTPUT_PATH.write_text(agent_api_mdx, encoding="utf-8")
    print("\nMDX Files Generated!")


if __name__ == "__main__":
    main()
