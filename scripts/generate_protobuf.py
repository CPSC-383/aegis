#!/usr/bin/env python3
"""
Script to generate protobuf code for Python and copy the .proto file to the client.
"""

import subprocess
import sys
from pathlib import Path
import shutil


def run_command(cmd, cwd=None):
    try:
        result = subprocess.run(
            cmd, shell=True, cwd=cwd, capture_output=True, text=True, check=False
        )
        if result.returncode != 0:
            print(f"Error running command: {cmd}")
            print(f"stdout: {result.stdout}")
            print(f"stderr: {result.stderr}")
            return False
        return True
    except Exception as e:
        print(f"Exception running command {cmd}: {e}")
        return False


def main():
    # Get the project root directory
    project_root = Path(__file__).parent.parent
    schemas_dir = project_root / "schemas"
    python_output_dir = project_root / "src" / "_aegis" / "protobuf"
    proto_file = schemas_dir / "aegis.proto"

    # Create output directory
    python_output_dir.mkdir(parents=True, exist_ok=True)

    # Generate Python protobuf code
    print("Generating Python protobuf code...")
    python_cmd = f"protoc --proto_path={schemas_dir} --python_out={python_output_dir} {proto_file}"
    if not run_command(python_cmd):
        print("Failed to generate Python protobuf code")
        sys.exit(1)

    # Generate mypy type stubs
    print("Generating mypy type stubs...")
    mypy_cmd = f"protoc --proto_path={schemas_dir} --mypy_out={python_output_dir} {proto_file}"
    if not run_command(mypy_cmd):
        print("Warning: Failed to generate mypy type stubs (mypy-protobuf may not be installed)")
        print("This is optional but recommended for better IDE support")

    # Create __init__.py for Python package
    init_file = python_output_dir / "__init__.py"
    if not init_file.exists():
        init_file.write_text("# Generated protobuf package\n")

    # COPY STEP: Copy .proto file to client directory
    # Change the destination below if/when client moves to a different spot later
    client_proto_dir = project_root / "client" / "src" / "protobuf"
    client_proto_dir.mkdir(parents=True, exist_ok=True)
    dest_proto_file = client_proto_dir / "aegis.proto"
    print(f"Copying {proto_file} to {dest_proto_file} ...")
    shutil.copy2(proto_file, dest_proto_file)

    print("Protobuf setup completed successfully!")
    print("Python code generated in: src/_aegis/protobuf/")
    print(f"Proto file copied to: {dest_proto_file}")


if __name__ == "__main__":
    main()
