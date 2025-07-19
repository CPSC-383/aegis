import argparse
from dataclasses import dataclass


@dataclass
class Args:
    amount: int
    world: str
    rounds: int
    client: bool
    agent: str
    group: str
    config: str
    debug: bool


def parse_args() -> Args:
    parser = argparse.ArgumentParser(description="AEGIS Simulation Configuration")

    _ = parser.add_argument(
        "--amount",
        type=int,
        default=1,
        help="Number of agents to run (default = 1)",
    )
    _ = parser.add_argument(
        "--world",
        type=str,
        required=True,
        help="World file to use.",
    )
    _ = parser.add_argument(
        "--rounds",
        type=int,
        required=True,
        help="Number of simulation rounds",
    )
    _ = parser.add_argument(
        "--agent",
        type=str,
        required=True,
        help="Path to the agent file",
    )
    _ = parser.add_argument(
        "--group",
        type=str,
        required=True,
        help="Group name",
    )
    _ = parser.add_argument(
        "--client",
        action="store_true",
        help="Set to wait for the client to connect",
    )
    _ = parser.add_argument(
        "--config",
        type=str,
        default="default",
        help="Config preset to use (default: default)",
    )
    _ = parser.add_argument(
        "--debug",
        action="store_true",
        help="Enable agent debug logging output",
    )

    args: Args = parser.parse_args()  # pyright: ignore[reportAssignmentType]

    return args
