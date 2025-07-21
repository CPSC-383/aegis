# noqa: INP001
# ruff: noqa: T201

"""Generate a index.ts file for ts schema."""

from pathlib import Path

TS_DIR = Path(__file__).parent.parent / "ts"
INDEX_FILE = TS_DIR / "index.ts"


def generate_index_ts() -> None:
    """Make index file with exports."""
    exports: list[str] = []

    for ts_file in TS_DIR.glob("*.ts"):
        if ts_file.name == "index.ts":
            continue
        module = ts_file.stem
        exports.append(f"export * from './{module}';")

    index_content = "\n".join(exports) + "\n"
    _ = INDEX_FILE.write_text(index_content)
    print(f"Generated {INDEX_FILE} with {len(exports)} exports.")


if __name__ == "__main__":
    generate_index_ts()
