import sys
import traceback

from .args_parser import parse_args
from .play import run

# TODO @dante: Add a init command
# https://github.com/CPSC-383/aegis/issues/128


def main() -> None:
    try:
        if len(sys.argv) == 1:
            print()
            print("AEGIS Simulation")
            print()
            print("For help, run: aegis --help")
            sys.exit(0)

        run(parse_args())
    except Exception:  # noqa: BLE001
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
