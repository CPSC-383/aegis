import logging

logging.basicConfig(
    level=logging.INFO,
    format="[%(levelname)s] - %(message)s",
    force=True,
)
LOGGER = logging.getLogger("aegis")
