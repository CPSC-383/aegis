import sys

from agent.base_agent import BaseAgent
from agent.log_levels import LogLevels
from agents.example_agent.example_agent import ExampleAgent


def main() -> None:
    if len(sys.argv) == 1:
        BaseAgent.set_log_level(LogLevels.Error)
        BaseAgent.get_base_agent().start_test(ExampleAgent())
    elif len(sys.argv) == 2:
        BaseAgent.set_log_level(LogLevels.Error)
        BaseAgent.get_base_agent().start_with_group_name(sys.argv[1], ExampleAgent())
    else:
        print(
            "Agent: Usage: python3 agents/example_agent/main.py <groupname> [hostname]"
        )


if __name__ == "__main__":
    main()
