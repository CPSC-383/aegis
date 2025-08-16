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


class LevelBasedFormatter(logging.Formatter):
    @override
    def format(self, record: logging.LogRecord) -> str:
        if record.name == "aegis":
            if record.levelno >= logging.WARNING:
                self._style._fmt = "[aegis:%(levelname)s] %(message)s"  # noqa: SLF001
            else:
                self._style._fmt = "[aegis] %(message)s"  # noqa: SLF001
        return super().format(record)


def setup_console_logging() -> None:
    """Set up basic console logging without file output."""
    formatter: logging.Formatter = LevelBasedFormatter()

    stdout_handler = logging.StreamHandler(stream=sys.stdout)
    stdout_handler.setLevel(logging.DEBUG)
    stdout_handler.addFilter(MaxLevelFilter(logging.INFO))
    stdout_handler.setFormatter(formatter)

    stderr_handler = logging.StreamHandler(stream=sys.stderr)
    stderr_handler.setLevel(logging.WARNING)
    stderr_handler.setFormatter(formatter)

    handlers: list[logging.Handler] = [stdout_handler, stderr_handler]

    logging.basicConfig(
        level=logging.INFO,
        handlers=handlers,
        force=True,
    )


def setup_console_and_file_logging() -> None:
    """Set up AEGIS logging with both console and file output."""
    formatter: logging.Formatter = LevelBasedFormatter()

    stdout_handler = logging.StreamHandler(stream=sys.stdout)
    stdout_handler.setLevel(logging.DEBUG)
    stdout_handler.addFilter(MaxLevelFilter(logging.INFO))
    stdout_handler.setFormatter(formatter)

    stderr_handler = logging.StreamHandler(stream=sys.stderr)
    stderr_handler.setLevel(logging.WARNING)
    stderr_handler.setFormatter(formatter)

    logs_dir: Path = Path.cwd() / "logs"
    logs_dir.mkdir(exist_ok=True)

    timestamp: str = datetime.now(UTC).strftime("%Y%m%d_%H%M%S")
    log_filename: str = f"aegis_simulation_{timestamp}.log"
    log_file_path: Path = logs_dir / log_filename

    file_handler: logging.FileHandler = logging.FileHandler(
        log_file_path, mode="w", encoding="utf-8"
    )
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(
        logging.Formatter("[%(asctime)s][%(levelname)s][%(name)s] - %(message)s")
    )

    handlers: list[logging.Handler] = [stdout_handler, stderr_handler, file_handler]

    logging.basicConfig(
        level=logging.INFO,
        handlers=handlers,
        force=True,
    )


LOGGER: logging.Logger = logging.getLogger("aegis")
