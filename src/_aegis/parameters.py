from dataclasses import dataclass


@dataclass
class Parameters:
    number_of_rounds: int = 100
    number_of_agents: int = 1
    world_filename: str = "ExampleWorld.world"
    agent: str = ""
    group_name: str = ""
    config_file: str = "default"
    debug: bool = False
