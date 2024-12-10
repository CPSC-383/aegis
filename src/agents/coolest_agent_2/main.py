import sys

from agent.base_agent import BaseAgent
from agents.coolest_agent_2.coolest_agent_2 import CoolestAgent2


def main() -> None:
    if len(sys.argv) == 1:
        BaseAgent.get_agent().start_test(CoolestAgent2())
    elif len(sys.argv) == 2:
        BaseAgent.get_agent().start_with_group_name(sys.argv[1], CoolestAgent2())
    else:
        print(
            "Agent: Usage: python3 agents/example_agent/main.py <groupname> [hostname]"
        )


if __name__ == "__main__":
    main()
