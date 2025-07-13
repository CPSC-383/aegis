from dataclasses import dataclass


@dataclass
class Parameters:
    number_of_rounds: int = 500
    number_of_agents: int = 0
    world_filename: str = "ExampleWorld.world"
    agent: str = ""
    group_name: str = ""
