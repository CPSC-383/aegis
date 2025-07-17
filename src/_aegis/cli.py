import sys
import traceback

from . import LOGGER
from .main import Aegis
from .parsers.args_parser import parse_args


def main() -> None:
    try:
        LOGGER.info("Aegis  : Initializing.")

        parameters, wait_for_client = parse_args()
        aegis = Aegis(parameters, wait_for_client=wait_for_client)

        LOGGER.info("Aegis  : Starting Up.")
        if not aegis.start_up():
            LOGGER.error("Aegis  : Unable to start up.")
            sys.exit(1)

        if not aegis.build_world():
            LOGGER.error("Aegis  : Error building world.")
            sys.exit(1)

        LOGGER.info("Aegis  : Waiting for agents.")
        _ = sys.stdout.flush()

        aegis.start_agents()
        aegis.run()
        aegis.shutdown()
        LOGGER.info("Aegis  : Done.")

    except Exception:  # noqa: BLE001
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
