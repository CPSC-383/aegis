import argparse
from dataclasses import dataclass

from .aegis_config import get_feature_value
from .constants import Constants


@dataclass
class TypedNamespace:
    command: str
    amount: int
    world: list[str]
    rounds: int
    agent: str | None
    agent2: str | None
    client: bool
    debug: bool
    log: bool


@dataclass
class LaunchArgs:
    amount: int
    world: list[str]
    rounds: int
    agent: str | None
    agent2: str | None
    client: bool
    debug: bool
    log: bool


@dataclass
class ForgeArgs:
    # If we ever need args
    pass


@dataclass
class Args:
    command: str
    launch_args: LaunchArgs | None = None
    forge_args: ForgeArgs | None = None


def parse_args() -> Args:
    parser = argparse.ArgumentParser(description="AEGIS Simulation")
    subparsers = parser.add_subparsers(dest="command", required=True)
    default_agent_amount = get_feature_value("DEFAULT_AGENT_AMOUNT")

    run_parser = subparsers.add_parser("launch", help="Run a game")
    _ = run_parser.add_argument(
        "--world",
        type=str,
        nargs="+",
        required=True,
        help="One or more world names (without .world extension), separated by spaces.",
    )
    _ = run_parser.add_argument(
        "--amount",
        type=int,
        default=default_agent_amount if default_agent_amount is not None else 1,
        help="Number of agents to run (default = 1)",
    )
    _ = run_parser.add_argument(
        "--rounds",
        type=int,
        default=Constants.DEFAULT_MAX_ROUNDS,
        help=f"Number of simulation rounds (default = {Constants.DEFAULT_MAX_ROUNDS})",
    )
    _ = run_parser.add_argument(
        "--agent",
        type=str,
        required=False,
        help=(
            "Name of the agent folder under 'agents/' with a main.py file "
            "for team Goobs (e.g., 'agent_path', 'agent_mas')"
        ),
    )
    _ = run_parser.add_argument(
        "--agent2",
        type=str,
        required=False,
        help=(
            "Name of the agent folder under 'agents/' with a main.py file "
            "for team Voidseers (e.g., 'agent_path', 'agent_mas')"
        ),
    )
    _ = run_parser.add_argument(
        "--client",
        action="store_true",
        help="Used by the client, tells the server to wait for the client to connect",
    )
    _ = run_parser.add_argument(
        "--debug",
        action="store_true",
        help="Enable agent debug logging output",
    )
    _ = run_parser.add_argument(
        "--log",
        action="store_true",
        help="Enable AEGIS console output logging to a file",
    )

    _ = subparsers.add_parser("forge", help="Make stub.py file after config changes")

    args = parser.parse_args(namespace=TypedNamespace)

    if args.command == "launch":
        return Args(
            command="run",
            launch_args=LaunchArgs(
                amount=args.amount,
                world=args.world,
                rounds=args.rounds,
                agent=args.agent,
                agent2=args.agent2,
                client=args.client,
                debug=args.debug,
                log=args.log,
            ),
        )
    if args.command == "forge":
        return Args(command="forge", forge_args=ForgeArgs())

    error = f"Unknown command: {args.command}"
    raise ValueError(error)
