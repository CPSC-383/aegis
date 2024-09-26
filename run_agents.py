import os
import platform
import subprocess
import sys
import time
from concurrent.futures import ThreadPoolExecutor


def usage() -> None:
    python = "python" if platform.system() == "Windows" else "python3"
    print(
        f"Usage: {python} run_agents.py <agent amount> <agent directory>"
    )
    print(
        f"Example: {python} run_agents.py 2 example_agent"
    )


def run_agent(agent: str) -> None:
    curr_dir = os.path.dirname(os.path.realpath(__file__))
    main = os.path.join(curr_dir, "src", "agents", agent, "main.py")
    python_command = "python" if platform.system() == "Windows" else "python3"
    command = [python_command, main]
    _ = subprocess.run(command)


def main(agent_amount: int, agentt: str) -> None:
    curr_dir = os.path.dirname(os.path.realpath(__file__))
    # # print(curr_dir)
    os.environ["PYTHONPATH"] = os.path.join(curr_dir, "src")
    os.environ["PYTHONPATH"] += os.pathsep + os.path.join(curr_dir, ".venv", "Lib", "site-packages")
    

    with ThreadPoolExecutor(max_workers=agent_amount + 1) as exec:

        agents = [exec.submit(run_agent, agentt) for _ in range(agent_amount)]

        for agent in agents:
            agent.result()


if __name__ == "__main__":
    if len(sys.argv) != 3:
        usage()
        sys.exit(1)

    try:
        agent_amount = int(sys.argv[1])
    except ValueError:
        print("Agent amount must be an integer.")
        sys.exit(1)

    agent = sys.argv[2]

    main(agent_amount, agent)
