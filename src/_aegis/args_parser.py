import argparse
from dataclasses import dataclass

from .aegis_config import get_feature_value
from .constants import Constants


@dataclass
class Args:
    amount: int
    world: str
    rounds: int
    agent: str | None
    agent2: str | None
    client: bool
    debug: bool
    log: bool


def parse_args() -> Args:
    parser = argparse.ArgumentParser(description="AEGIS Simulation Configuration")

    _ = parser.add_argument(
        "--world",
        type=str,
        required=True,
        help="World file to use.",
    )
    _ = parser.add_argument(
        "--amount",
        type=int,
        default=get_feature_value("DEFAULT_AGENT_AMOUNT", 1),
        help="Number of agents to run (default = 1)",
    )
    _ = parser.add_argument(
        "--rounds",
        type=int,
        default=Constants.DEFAULT_MAX_ROUNDS,
        help=f"Number of simulation rounds (default = {Constants.DEFAULT_MAX_ROUNDS})",
    )
    _ = parser.add_argument(
        "--agent",
        type=str,
        required=False,
        help="Path to the agent file for team goobs",
    )
    _ = parser.add_argument(
        "--agent2",
        type=str,
        required=False,
        help="Path to the agent file for team voidseers",
    )
    _ = parser.add_argument(
        "--client",
        action="store_true",
        help="Used by the client, tells the server to wait for the client to connect",
    )
    _ = parser.add_argument(
        "--debug",
        action="store_true",
        help="Enable agent debug logging output",
    )
    _ = parser.add_argument(
        "--log",
        action="store_true",
        help="Enable AEGIS console output logging to a file",
    )

    args: Args = parser.parse_args()  # pyright: ignore[reportAssignmentType]

    return args
