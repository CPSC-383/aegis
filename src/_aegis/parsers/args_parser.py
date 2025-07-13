import argparse
from dataclasses import dataclass

from _aegis.assist.parameters import Parameters


@dataclass
class Args:
    agent_amount: int
    world_file: str
    rounds: int
    client: bool
    agent: str
    group_name: str


def parse_args() -> tuple[Parameters, bool]:
    parser = argparse.ArgumentParser(description="AEGIS Simulation Configuration")

    _ = parser.add_argument(
        "--agent-amount", type=int, default=1, help="Number of agents to run"
    )
    _ = parser.add_argument(
        "--world-file",
        type=str,
        required=True,
        help="Indicates the file AEGIS should use to build the world from upon startup.",
    )
    _ = parser.add_argument(
        "--rounds", type=int, required=True, help="Number of simulation rounds"
    )
    _ = parser.add_argument(
        "--agent", type=str, required=True, help="Path to the agent file"
    )
    _ = parser.add_argument("--group-name", type=str, required=True, help="Group name")
    _ = parser.add_argument(
        "--client", action="store_true", help="Set to wait for the client to connect"
    )

    args: Args = parser.parse_args()  # pyright: ignore[reportAssignmentType]

    params = Parameters()
    params.number_of_agents = args.agent_amount
    params.world_filename = args.world_file
    params.number_of_rounds = args.rounds
    params.agent = args.agent
    params.group_name = args.group_name

    return params, args.client
