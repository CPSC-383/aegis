# noqa: INP001
# ruff: noqa: T201
"""
Script to generate protobuf code for Python.

Also copy the .proto files to the client.
"""

import re
import shutil
import subprocess
import sys
from pathlib import Path


def run_command(cmd: str, cwd: Path | None = None) -> bool:
    try:
        result = subprocess.run(
            cmd,
            shell=True,
            cwd=cwd,
            capture_output=True,
            text=True,
            check=False,
        )
        if result.returncode != 0:
            print(f"Error running command: {cmd}")
            print(f"stdout:\n{result.stdout}")
            print(f"stderr:\n{result.stderr}")
            return False
    except Exception as e:
        print(f"Exception running command {cmd}: {e}")
        return False
    else:
        return True


def fix_proto_imports(directory: Path) -> None:
    """Fix imports in generated protobuf Python files to use relative imports."""
    print(f"Fixing imports in {directory} ...")
    pattern = re.compile(r"^import (.+_pb2) as (.+_pb2)", re.MULTILINE)

    for pyi_file in directory.rglob("*.pyi"):
        text = pyi_file.read_text()
        new_text = pattern.sub(r"from . import \1 as \2", text)

        if text != new_text:
            _ = pyi_file.write_text(new_text)
            print(f"Fixed imports in {pyi_file.relative_to(directory)}")


def main() -> None:
    """Run to execute script."""
    project_root: Path = Path(__file__).parent.parent.resolve()
    schemas_dir: Path = project_root / "schema"
    python_output_dir: Path = project_root / "src" / "_aegis" / "schemas"
    proto_files: str = str(schemas_dir / "*.proto")

    # Clean previous generated files
    if python_output_dir.exists():
        print(f"Cleaning previous generated files in {python_output_dir}")
        shutil.rmtree(python_output_dir)
    python_output_dir.mkdir(parents=True, exist_ok=True)

    print("Generating Python protobuf code...")
    python_cmd = f"protoc --proto_path={schemas_dir} --python_out={python_output_dir} {proto_files}"
    if not run_command(python_cmd):
        print("Failed to generate Python protobuf code")
        sys.exit(1)

    print("Generating mypy type stubs...")
    mypy_cmd = (
        f"protoc --proto_path={schemas_dir} --pyi_out={python_output_dir} {proto_files}"
    )
    if not run_command(mypy_cmd):
        print(
            "Warning: Failed to generate mypy type stubs (mypy-protobuf may not be installed)"
        )

    fix_proto_imports(python_output_dir)

    init_file: Path = python_output_dir / "__init__.py"
    _ = init_file.write_text("# Generated protobuf package\n")

    client_proto_dir: Path = project_root / "client" / "src" / "protobuf"
    client_proto_dir.mkdir(parents=True, exist_ok=True)

    print("Copying .proto files to client directory...")
    for proto in schemas_dir.glob("*.proto"):
        dest = client_proto_dir / proto.name
        _ = shutil.copy2(proto, dest)

    print("Protobuf setup completed successfully!")
    print(f"Python code generated in: {python_output_dir}")
    print(f".proto files copied to: {client_proto_dir}")


if __name__ == "__main__":
    main()
