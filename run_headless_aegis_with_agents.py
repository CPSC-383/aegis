import argparse
import os
import platform
import subprocess
import sys
import time
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass


@dataclass
class RunnerArgs:
    rounds: int
    agent_directory: str
    world_file: str
    verbose: bool
    agent_amount: int


class AegisRunner:
    def __init__(
        self,
        agent_amount: int,
        rounds: int,
        world_file: str,
        agent_name: str,
        verbose: bool = False,
    ):
        """
        Initialize the AEGIS runner with configuration parameters.

        Args:
            agent_amount (int): Number of agent instances to run
            rounds (int): Number of simulation rounds
            world_file (str): Name of the world file to use
            agent_name (str): Name of the agent to run
            verbose (bool): Enable verbose logging
        """
        self.curr_dir: str = os.path.dirname(os.path.realpath(__file__))
        self.agent_amount: int = max(1, agent_amount)
        self.rounds: int = rounds
        self.world_file: str = world_file
        self.agent_name: str = agent_name
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
        os.environ["PYTHONPATH"] = os.path.join(self.curr_dir, "src")

        # Add virtual environment site-packages if it exists
        venv_path = os.path.join(self.curr_dir, ".venv", "Lib", "site-packages")
        if os.path.exists(venv_path):
            os.environ["PYTHONPATH"] += os.pathsep + venv_path

        self._log(f"PYTHONPATH set to: {os.environ['PYTHONPATH']}")

    def run_agent(self, agent_index: int | None = None) -> None:
        """
        Run a single agent instance.

        Args:
            agent_index (Optional[int]): Optional index for multi-agent logging
        """
        agent_main = os.path.join(
            self.curr_dir, "src", "agents", self.agent_name, "main.py"
        )

        if not os.path.exists(agent_main):
            raise FileNotFoundError(f"Agent main script not found: {agent_main}")

        command = [self.python_command, agent_main]
        self._log(
            f"Running agent {agent_index if agent_index is not None else ''}: {' '.join(command)}"
        )

        result = subprocess.run(command)

        if result.returncode != 0:
            print(f"Agent run failed with error:\n{result.stderr}")

    def run_aegis(self) -> None:
        """
        Run the AEGIS simulation.
        """
        aegis_main = os.path.join(self.curr_dir, "src", "aegis", "main.py")

        if not os.path.exists(aegis_main):
            raise FileNotFoundError(f"AEGIS main script not found: {aegis_main}")

        command = [
            self.python_command,
            aegis_main,
            "-NoKViewer",
            str(self.agent_amount),
            "-WorldFile",
            f"worlds/{self.world_file}.world",
            "-NumRound",
            str(self.rounds),
        ]

        self._log(f"Running AEGIS: {' '.join(command)}")
        result = subprocess.run(command)

        if result.returncode != 0:
            print(f"AEGIS run failed with error:\n{result.stderr}")

    def run(self) -> None:
        """
        Run AEGIS simulation with agents using thread pool.
        """
        self._setup_environment()

        with ThreadPoolExecutor(max_workers=self.agent_amount + 1) as executor:
            # Start AEGIS first
            _ = executor.submit(self.run_aegis)
            time.sleep(1)  # Brief pause to ensure AEGIS starts

            # Run agents
            agent_futures = [
                executor.submit(self.run_agent, i) for i in range(self.agent_amount)
            ]

            # Wait for all agents to complete
            for future in agent_futures:
                future.result()


def main():
    """
    Main entry point with command-line argument parsing.
    """
    parser = argparse.ArgumentParser(
        description="Run AEGIS simulation with agents",
        epilog="Example: python run_headless_aegis_with_agents.py --rounds 50  --agent example_agent --world ExampleWorld",
    )
    _ = parser.add_argument(
        "--rounds", type=int, required=True, help="Number of simulation rounds"
    )
    _ = parser.add_argument(
        "--agent",
        dest="agent_directory",
        type=str,
        required=True,
        help="Directory of the agent to run",
    )
    _ = parser.add_argument(
        "--world",
        dest="world_file",
        type=str,
        required=True,
        help="Name of the world file to use",
    )
    _ = parser.add_argument(
        "--agent-amount",
        type=int,
        required=True,
        help="Number of agent instances to run",
    )
    _ = parser.add_argument(
        "--verbose", "-v", action="store_true", help="Enable verbose logging"
    )

    args: RunnerArgs = parser.parse_args()  # pyright: ignore[reportAssignmentType]

    runner = AegisRunner(
        agent_amount=args.agent_amount,
        rounds=args.rounds,
        world_file=args.world_file,
        agent_name=args.agent_directory,
        verbose=args.verbose,
    )

    try:
        runner.run()
    except Exception as e:
        print(f"An error occurred: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
