import json
from pathlib import Path
from typing import cast
from _aegis.types import Config

CONFIG_PATH = Path("config/config.json")
_config: Config | None = None


def load_config(path: Path = CONFIG_PATH) -> Config:
    global _config
    if _config is not None:
        return _config

    if not path.exists():
        raise FileNotFoundError(f"Config not found: {path}")

    with open(path, "r") as f:
        _config = cast(Config, json.load(f))

    return _config


def is_feature_enabled(feature: str) -> bool:
    config = load_config()
    return config.get(feature, False)
