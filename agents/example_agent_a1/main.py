import sys

from aegis import BaseAgent
from agents.example_agent_a1.example_agent import ExampleAgent


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Missing Group Name")

    BaseAgent.get_agent().start(sys.argv[1], ExampleAgent())
