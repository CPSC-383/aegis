import os
import platform
import subprocess
import sys
import time
from concurrent.futures import ThreadPoolExecutor


def usage() -> None:
    print(
        "Usage: python run_headless_aegis_with_agents.py <agent amount> <num of rounds> <agent directory> <world file>"
    )


def run_agent(agent: str) -> None:
    curr_dir = os.path.dirname(os.path.realpath(__file__))
    main = os.path.join(curr_dir, "src", "agents", agent, "main.py")
    python_command = "python" if platform.system() == "Windows" else "python3"
    command = [python_command, main]
    _ = subprocess.run(command)


def run_aegis(curr_dir: str, agent_amount: int, rounds: int, world_file: str) -> None:
    main = os.path.join(curr_dir, "src", "aegis", "main.py")
    python_command = "python" if platform.system() == "Windows" else "python3"
    command = [
        python_command,
        main,
        "-NoKViewer",
        str(agent_amount),
        "-WorldFile",
        f"worlds/{world_file}.world",
        "-NumRound",
        str(rounds),
    ]

    _ = subprocess.run(command)


def main(agent_amount: int, rounds: int, world_file: str, agentt: str) -> None:
    curr_dir = os.path.dirname(os.path.realpath(__file__))
    # # print(curr_dir)
    os.environ["PYTHONPATH"] = os.path.join(curr_dir, "src")
    os.environ["PYTHONPATH"] += os.pathsep + os.path.join(
        curr_dir, ".venv", "Lib", "site-packages"
    )

    with ThreadPoolExecutor(max_workers=agent_amount + 1) as exec:
        _ = exec.submit(run_aegis, curr_dir, agent_amount, rounds, world_file)

        time.sleep(1)  # Ensure that AEGIS runs before the agents

        agents = [exec.submit(run_agent, agentt) for _ in range(agent_amount)]

        for agent in agents:
            agent.result()


if __name__ == "__main__":
    if len(sys.argv) != 5:
        usage()
        sys.exit(1)

    try:
        agent_amount = int(sys.argv[1])
    except ValueError:
        print("Agent amount must be an integer.")
        sys.exit(1)

    try:
        rounds = int(sys.argv[2])
    except ValueError:
        print("Round amount must be an integer.")
        sys.exit(1)

    agent = sys.argv[3]
    world_file = sys.argv[4]

    main(agent_amount, rounds, world_file, agent)
