from _aegis.assist.config_settings import ConfigSettings


class Parameters:
    milliseconds_to_wait_for_agent_command: int = int(1.25 * 1000)
    milliseconds_to_wait_for_agent_connect: int = 5 * 1000
    number_of_rounds: int = 500
    number_of_agents: int = 0
    replay_filename: str = "replay.txt"
    world_filename: str = "ExampleWorld.world"
    agent: str = ""
    group_name: str = ""
    OBSERVE_ENERGY_COST: int = 1
    SAVE_SURV_ENERGY_COST: int = 1
    PREDICTION_ENERGY_COST: int = 1
    TEAM_DIG_ENERGY_COST: int = 1
    MOVE_ENERGY_COST: int = 1
    config_settings: ConfigSettings | None = None
