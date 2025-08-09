from pathlib import Path
from typing import Any

import yaml

CONFIG_PATH = Path.cwd() / "config" / "config.yaml"


def load_config() -> dict[str, Any]:
    """Load the main configuration file."""
    if not CONFIG_PATH.exists():
        error = f"Main config file not found: {CONFIG_PATH}"
        raise FileNotFoundError(error)

    with Path.open(CONFIG_PATH) as f:
        return yaml.safe_load(f)


def is_feature_enabled(feature: str) -> bool:
    """Check if a feature is enabled in the config."""
    config = load_config()

    if config.get("features", {}).get(feature, False):
        return True

    if config.get("assignment_specific", {}).get(feature, False):
        return True

    return config.get("competition_specific", {}).get(feature, False)


def is_assignment_specific_enabled(setting: str) -> bool:
    """Check if an assignment-specific setting is enabled."""
    config = load_config()
    return config.get("assignment_specific", {}).get(setting, False)


def is_competition_specific_enabled(setting: str) -> bool:
    """Check if a competition-specific setting is enabled."""
    config = load_config()
    return config.get("competition_specific", {}).get(setting, False)


def get_feature_value(feature: str, default: Any = None) -> Any:  # noqa: ANN401
    """Get a feature value from the config."""
    config = load_config()

    if feature in config.get("features", {}):
        return config["features"][feature]

    if feature in config.get("assignment_specific", {}):
        return config["assignment_specific"][feature]

    if feature in config.get("competition_specific", {}):
        return config["competition_specific"][feature]

    return default


def get_assignment_specific_value(setting: str, default: Any = None) -> Any:  # noqa: ANN401
    """Get an assignment-specific setting value."""
    config = load_config()
    return config.get("assignment_specific", {}).get(setting, default)


def get_competition_specific_value(setting: str, default: Any = None) -> Any:  # noqa: ANN401
    """Get a competition-specific setting value."""
    config = load_config()
    return config.get("competition_specific", {}).get(setting, default)


def get_feature_config() -> dict[str, Any]:
    """Get the features section from the main config."""
    config = load_config()
    return config.get("features", {})


def get_assignment_specific_config() -> dict[str, Any]:
    """Get the assignment_specific section from the main config."""
    config = load_config()
    return config.get("assignment_specific", {})


def get_competition_specific_config() -> dict[str, Any]:
    """Get the competition_specific section from the main config."""
    config = load_config()
    return config.get("competition_specific", {})
