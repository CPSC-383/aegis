import json
from pathlib import Path
from typing import cast
from _aegis.aegis_types import Config

CONFIG_PATH = Path("config/config.json")


def load_config(path: Path = CONFIG_PATH) -> Config:
    if not path.exists():
        raise FileNotFoundError(f"Config not found: {path}")

    with open(path, "r") as f:
        config = cast(Config, json.load(f))

    return config


def is_feature_enabled(feature: str) -> bool:
    config = load_config()
    return config.get(feature, False)
