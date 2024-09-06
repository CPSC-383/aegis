import sys

from agent.base_agent import BaseAgent
from agent.log_levels import LogLevels
from agents.predicting_agent.predicting_agent import PredictingAgent


def main() -> None:
    if len(sys.argv) == 1:
        BaseAgent.set_log_level(LogLevels.All)
        BaseAgent.get_base_agent().start_test(PredictingAgent())
    elif len(sys.argv) == 2:
        BaseAgent.set_log_level(LogLevels.All)
        BaseAgent.get_base_agent().start_with_group_name(sys.argv[1], PredictingAgent())
    elif len(sys.argv) == 3:
        BaseAgent.set_log_level(LogLevels.All)
        BaseAgent.get_base_agent().start(sys.argv[1], sys.argv[2], PredictingAgent())
    else:
        print(
            "Agent: Usage: python3 agent/agents/example_agent/main.py <groupname> [hostname]"
        )


if __name__ == "__main__":
    main()
