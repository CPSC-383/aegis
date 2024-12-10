import sys

from agent.base_agent import BaseAgent
from agents.coolest_agent.coolest_agent import CoolestAgent


def main() -> None:
    if len(sys.argv) == 1:
        BaseAgent.get_agent().start_test(CoolestAgent())
    elif len(sys.argv) == 2:
        BaseAgent.get_agent().start_with_group_name(sys.argv[1], CoolestAgent())
    else:
        print(
            "Agent: Usage: python3 agents/example_agent/main.py <groupname> [hostname]"
        )


if __name__ == "__main__":
    main()
