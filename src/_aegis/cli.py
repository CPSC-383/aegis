import sys
import traceback

from .args_parser import parse_args
from .play import run
from .stub_generator import main as stub_gen

# TODO @dante: Add a init command
# https://github.com/CPSC-383/aegis/issues/128


def main() -> None:
    args = parse_args()

    if args.command == "run":
        try:
            if args.launch_args is None:
                sys.exit(1)
            run(args.launch_args)
        except Exception:  # noqa: BLE001
            traceback.print_exc()
            sys.exit(1)

    elif args.command == "forge":
        try:
            stub_gen()
        except Exception:  # noqa: BLE001
            traceback.print_exc()
            sys.exit(1)


if __name__ == "__main__":
    main()
