from dataclasses import dataclass


@dataclass
class Parameters:
    milliseconds_to_wait_for_agent_command: int = int(1.25 * 1000)
    milliseconds_to_wait_for_agent_connect: int = 5 * 1000
    number_of_rounds: int = 500
    number_of_agents: int = 0
    world_filename: str = "ExampleWorld.world"
    agent: str = ""
    group_name: str = ""
