from pathlib import Path
from typing import cast

import yaml

from .types.config import Config, FeatureFlagName

CONFIG_PRESETS_PATH = Path("config/presets")
DEFAULT_CONFIG = "default"


def load_config(config_name: str = DEFAULT_CONFIG) -> Config:
    config_path = CONFIG_PRESETS_PATH / f"{config_name}.yaml"

    if not config_path.exists():
        error = f"Config preset not found: {config_path}"
        raise FileNotFoundError(error)

    with Path.open(config_path) as f:
        return cast("Config", yaml.safe_load(f))


def is_feature_enabled(
    feature: FeatureFlagName, config_name: str = DEFAULT_CONFIG
) -> bool:
    config = load_config(config_name)
    return config.get(feature, False)
