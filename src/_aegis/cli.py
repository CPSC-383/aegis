import sys
import traceback

from .args_parser import parse_args
from .init_scaffold import init_scaffold
from .play import run

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
        from .stub_generator import main as stub_gen  # noqa: PLC0415

        try:
            stub_gen()
        except Exception:  # noqa: BLE001
            traceback.print_exc()
            sys.exit(1)
    elif args.command == "init":
        try:
            if args.init_args is None:
                sys.exit(1)
            init_scaffold(args.init_args.init_type)
        except Exception:  # noqa: BLE001
            traceback.print_exc()
            sys.exit(1)


if __name__ == "__main__":
    main()
