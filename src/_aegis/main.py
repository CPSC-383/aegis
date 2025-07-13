import traceback
import sys

from _aegis.aegis_main import Aegis
from _aegis.parsers.args_parser import parse_args


def main() -> None:
    try:
        print("Aegis  : Initializing.")

        parameters, wait_for_client = parse_args()
        aegis = Aegis(parameters, wait_for_client)

        print("Aegis  : Starting Up.")
        if not aegis.start_up():
            print("Aegis  : Unable to start up.", file=sys.stderr)
            sys.exit(1)

        if not aegis.build_world():
            print("Aegis  : Error building world.", file=sys.stderr)
            sys.exit(1)

        print("Aegis  : Waiting for agents.")
        _ = sys.stdout.flush()

        aegis.start_agents()
        aegis.run_state()
        aegis.shutdown()
        print("Aegis  : Done.")

    except Exception as e:
        print(f"Exception: {e}", file=sys.stderr)
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
