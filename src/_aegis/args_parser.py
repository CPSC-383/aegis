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
    testing_for_marking: bool


def parse_args() -> Args:
    parser = argparse.ArgumentParser(description="AEGIS Simulation Configuration")

    _ = parser.add_argument(
        "--world",
        type=str,
        nargs="+",
        required=True,
        help="One or more world file names (without extensions), separated by spaces.",
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
        help=(
            "Name of the agent folder under 'agents/' with a main.py file "
            "for team Goobs"
        ),
    )
    _ = parser.add_argument(
        "--agent2",
        type=str,
        required=False,
        help=(
            "Name of the agent folder under 'agents/' with a main.py file "
            "for team Voidseers"
        ),
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
    _ = parser.add_argument(
        "--testing-for-marking",
        action="store_true",
        help="Use marking testing data instead of standard testing data",
    )

    args: Args = parser.parse_args()  # pyright: ignore[reportAssignmentType]

    return args
