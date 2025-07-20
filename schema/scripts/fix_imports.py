# noqa: INP001
# ruff: noqa: T201

"""Fix protobuf Python imports in generated files and fix index.ts export."""

import re
from pathlib import Path

PYTHON_DIR = Path(__file__).parent.parent / "python"
TS_DIR = Path(__file__).parent.parent / "ts"
INDEX_TS = TS_DIR / "index.ts"


def fix_imports(file: Path) -> None:
    """Fix the broken imports caused by protoc Python plugin."""
    content = file.read_text()

    # Replace 'import xyz_pb2 as _xyz_pb2' with 'from . import xyz_pb2 as _xyz_pb2'
    pattern = re.compile(r"^import (.+_pb2) as (.+_pb2)", re.MULTILINE)
    fixed_content = pattern.sub(r"from . import \1 as \2", content)

    _ = file.write_text(fixed_content)


def fix_index_ts(file: Path) -> None:
    """Fix index.ts export from 'export * as aegis' to 'export *'."""
    if not file.exists():
        print(f"File not found: {file}")
        return

    content = file.read_text()

    fixed_content = content.replace(
        'export * as aegis from "./index.aegis";', 'export * from "./index.aegis";'
    )

    if fixed_content == content:
        print(f"No changes made to {file.name}. Pattern not found.")
    else:
        _ = file.write_text(fixed_content, encoding="utf-8")
        print(f"File {file.name} updated successfully.")


def main() -> None:
    """Run all fixes."""
    print(f"Fixing imports in {PYTHON_DIR}")
    for py_file in PYTHON_DIR.glob("*.pyi"):
        print(f"Fixing {py_file.name}")
        fix_imports(py_file)

    print(f"Fixing {INDEX_TS.name}")
    fix_index_ts(INDEX_TS)

    print("Done fixing files.")


if __name__ == "__main__":
    main()
