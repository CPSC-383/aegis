import logging
import sys
from datetime import UTC, datetime
from pathlib import Path
from typing import override


class MaxLevelFilter(logging.Filter):
    def __init__(self, max_level: int) -> None:
        super().__init__()
        self.max_level: int = max_level

    @override
    def filter(self, record: logging.LogRecord) -> bool:
        return record.levelno <= self.max_level


def setup_console_logging() -> None:
    """Set up basic console logging without file output."""
    stdout_handler = logging.StreamHandler(stream=sys.stdout)
    stdout_handler.setLevel(logging.DEBUG)
    stdout_handler.addFilter(MaxLevelFilter(logging.INFO))

    stderr_handler = logging.StreamHandler(stream=sys.stderr)
    stderr_handler.setLevel(logging.WARNING)

    handlers = [stdout_handler, stderr_handler]

    logging.basicConfig(
        level=logging.INFO,
        format="[%(levelname)s][%(name)s] - %(message)s",
        handlers=handlers,
        force=True,
    )


def setup_console_and_file_logging() -> None:
    """Set up AEGIS logging with both console and file output."""
    stdout_handler = logging.StreamHandler(stream=sys.stdout)
    stdout_handler.setLevel(logging.DEBUG)
    stdout_handler.addFilter(MaxLevelFilter(logging.INFO))

    stderr_handler = logging.StreamHandler(stream=sys.stderr)
    stderr_handler.setLevel(logging.WARNING)

    # Create logs directory if it doesn't exist
    logs_dir = Path("logs")
    logs_dir.mkdir(exist_ok=True)

    # Generate unique filename with datetime
    timestamp = datetime.now(UTC).strftime("%Y%m%d_%H%M%S")
    log_filename = f"aegis_simulation_{timestamp}.log"
    log_file_path = logs_dir / log_filename

    file_handler = logging.FileHandler(log_file_path, mode="w", encoding="utf-8")
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(
        logging.Formatter("[%(levelname)s][%(name)s] - %(message)s")
    )

    handlers = [stdout_handler, stderr_handler, file_handler]

    logging.basicConfig(
        level=logging.INFO,
        format="[%(levelname)s][%(name)s] - %(message)s",
        handlers=handlers,
        force=True,
    )


# AEGIS logger - used for both simulation events and agent logging
LOGGER = logging.getLogger("aegis")
