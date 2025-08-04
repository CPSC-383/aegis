import sys
import traceback

from .args_parser import parse_args
from .play import run

# TODO @dante: Add a init command
# https://github.com/CPSC-383/aegis/issues/128


def main() -> None:
    try:
        # Check if no arguments were provided
        if len(sys.argv) == 1:
            print("AEGIS Simulation Tool")
            print("=====================")
            print()
            print("Usage: aegis [OPTIONS]")
            print()
            print("Required arguments:")
            print("  --world WORLD [WORLD ...]  World names (without .world extension)")
            print("  --agent AGENT              Agent folder name (e.g., 'agent_path')")
            print()
            print("Examples:")
            print("  aegis --world ExampleWorld --agent agent_path --rounds 100")
            print("  aegis --world ExampleWorld --agent agent_path --agent2 agent_mas")
            print("  aegis --world ExampleWorld --agent agent_path --client")
            print()
            print("For more options, run: aegis --help")
            sys.exit(0)

        run(parse_args())
    except Exception:  # noqa: BLE001
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
