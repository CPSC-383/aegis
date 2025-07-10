# Public API exposed here
from _aegis import config


def run() -> None:
    _ = config.load_config()
