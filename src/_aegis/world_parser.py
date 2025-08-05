from pathlib import Path

from google.protobuf.message import DecodeError

from .world import World
from .world_proto import deserialize_world


def load_world(filename: Path) -> World | None:
    try:
        with filename.open("rb") as file:
            data = file.read()
        return deserialize_world(data)

    except (FileNotFoundError, DecodeError):
        return None
