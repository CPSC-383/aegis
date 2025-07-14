from pathlib import Path
from typing import cast
import yaml

from _aegis.aegis_types import Config, FeatureFlagName

CONFIG_PATH = Path("config/config.yaml")


def load_config(path: Path = CONFIG_PATH) -> Config:
    if not path.exists():
        raise FileNotFoundError(f"Config not found: {path}")

    with open(path, "r") as f:
        config = cast(Config, yaml.safe_load(f))

    return config


def is_feature_enabled(feature: FeatureFlagName) -> bool:
    config = load_config()
    return config.get(feature, False)
