import logging
import sys
from typing import override


class MaxLevelFilter(logging.Filter):
    def __init__(self, max_level: int) -> None:
        super().__init__()
        self.max_level: int = max_level

    @override
    def filter(self, record: logging.LogRecord) -> bool:
        return record.levelno <= self.max_level


stdout_handler = logging.StreamHandler(stream=sys.stdout)
stdout_handler.setLevel(logging.DEBUG)
stdout_handler.addFilter(MaxLevelFilter(logging.INFO))

stderr_handler = logging.StreamHandler(stream=sys.stderr)
stderr_handler.setLevel(logging.WARNING)

handlers = [stdout_handler, stderr_handler]

logging.basicConfig(
    level=logging.INFO,
    format="[%(levelname)s] - %(message)s",
    handlers=handlers,
    force=True,
)
LOGGER = logging.getLogger("aegis")
