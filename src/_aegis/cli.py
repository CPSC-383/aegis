import argparse
import os
import platform
import subprocess
import sys
from dataclasses import dataclass


@dataclass
class RunnerArgs:
    rounds: int
    agent: str
    world: str
    verbose: bool
    amount: int
    group: str


class AegisRunner:
    def __init__(
        self,
        agent_amount: int,
        rounds: int,
        world_file: str,
        agent: str,
        group_name: str,
        verbose: bool = False,
    ):
        """
        Initialize the AEGIS runner with configuration parameters.

        Args:
            agent_amount (int): Number of agent instances to run
            rounds (int): Number of simulation rounds
            world_file (str): Path of the world file to use
            agent (str): Path of the agent to run
            group_name (str): Group name
            verbose (bool): Enable verbose logging
        """
        self.curr_dir: str = os.path.dirname(os.path.realpath(__file__))
        self.agent_amount: int = max(1, agent_amount)
        self.rounds: int = rounds
        self.world_file: str = world_file
        self.agent: str = agent
        self.group_name: str = group_name
        self.verbose: bool = verbose

        # Setup Python command based on platform
        self.python_command: str = (
            "python" if platform.system() == "Windows" else "python3"
        )

    def _log(self, message: str) -> None:
        """
        Log messages if verbose mode is enabled.

        Args:
            message (str): Message to log
        """
        if self.verbose:
            print(f"[AEGIS RUNNER] {message}")

    def _setup_environment(self) -> None:
        """
        Set up the Python path environment variables.
        """

        venv_path = os.environ["VIRTUAL_ENV"]

        if platform.system() == "Windows":
            python_executable = os.path.join(venv_path, "Scripts", "python.exe")
        else:
            python_executable = os.path.join(venv_path, "bin", "python")

        if os.path.exists(python_executable):
            self.python_command = python_executable
        else:
            raise FileNotFoundError(
                f"Python executable not found in venv: {python_executable}"
            )

        project_root = os.path.abspath(os.path.join(self.curr_dir, "..", ".."))
        os.environ["PYTHONPATH"] = project_root

        self._log(f"Using Python interpreter: {self.python_command}")
        self._log(f"PYTHONPATH set to: {os.environ['PYTHONPATH']}")

    def run_aegis(self) -> None:
        """
        Run the AEGIS simulation.
        """
        aegis_main = os.path.join(self.curr_dir, "main.py")

        if not os.path.exists(aegis_main):
            raise FileNotFoundError(f"AEGIS main script not found: {aegis_main}")

        command = [
            self.python_command,
            aegis_main,
            "--amount",
            str(self.agent_amount),
            "--agent",
            self.agent,
            "--world",
            self.world_file,
            "--rounds",
            str(self.rounds),
            "--group",
            self.group_name,
        ]

        self._log(f"Running AEGIS: {' '.join(command)}")
        result = subprocess.run(command)

        if result.returncode != 0:
            print(f"AEGIS run failed with error:\n{result.stderr}")

    def run(self) -> None:
        """
        Run AEGIS simulation with agents.
        """
        # self._setup_environment()
        self.run_aegis()


def main():
    """
    Main entry point with command-line argument parsing.
    """
    parser = argparse.ArgumentParser(
        description="Run AEGIS simulation with agents",
        epilog="Example: aegis --rounds 50 --agent agents/example_agent/main.py --world worlds/ExampleWorld --group Test",
    )
    _ = parser.add_argument(
        "--rounds", type=int, required=True, help="Number of simulation rounds"
    )
    _ = parser.add_argument(
        "--agent",
        type=str,
        required=True,
        help="Path to the directory of the agent to run",
    )
    _ = parser.add_argument(
        "--world",
        type=str,
        required=True,
        help="Path to the world file to use",
    )
    _ = parser.add_argument(
        "--amount",
        type=int,
        default=1,
        help="Number of agent instances to run (default: 1)",
    )
    _ = parser.add_argument(
        "--group",
        type=str,
        required=True,
        help="Group name",
    )
    _ = parser.add_argument(
        "--verbose", "-v", action="store_true", help="Enable verbose logging"
    )

    args: RunnerArgs = parser.parse_args()  # pyright: ignore[reportAssignmentType]

    runner = AegisRunner(
        agent_amount=args.amount,
        rounds=args.rounds,
        world_file=args.world,
        agent=args.agent,
        group_name=args.group,
        verbose=args.verbose,
    )

    try:
        runner.run()
    except Exception as e:
        print(f"An error occurred: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
