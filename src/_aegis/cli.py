import sys
import traceback

from .parsers.args_parser import parse_args
from .play import run

# TODO @dante: Add a init command
# https://github.com/CPSC-383/aegis/issues/128


def main() -> None:
    try:
        run(parse_args())

        # aegis = Aegis(parameters, wait_for_client=wait_for_client)
        #
        # if not aegis.start_up():
        #     LOGGER.error("Aegis  : Unable to start up.")
        #     sys.exit(1)
        #
        # if not aegis.build_world():
        #     LOGGER.error("Aegis  : Error building world.")
        #     sys.exit(1)
        #
        # aegis.run()
        # LOGGER.info("Aegis  : Done.")

    except Exception:  # noqa: BLE001
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
