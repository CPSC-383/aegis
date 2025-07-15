from pathlib import Path
from typing import cast
import yaml

from _aegis.aegis_types import Config, FeatureFlagName

CONFIG_PRESETS_PATH = Path("config/presets")
DEFAULT_CONFIG = "default"


def load_config(config_name: str = DEFAULT_CONFIG) -> Config:
    # Construct the path to the config preset file
    config_path = CONFIG_PRESETS_PATH / f"{config_name}.yaml"

    if not config_path.exists():
        raise FileNotFoundError(f"Config preset not found: {config_path}")

    with open(config_path, "r") as f:
        config = cast(Config, yaml.safe_load(f))

    return config


def is_feature_enabled(feature: FeatureFlagName, config_name: str = DEFAULT_CONFIG) -> bool:
    config = load_config(config_name)
    return config.get(feature, False)
