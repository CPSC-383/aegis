class Constants:
    # Charging constants
    NORMAL_CHARGE: int = 5
    LOW_CHARGE: int = 1
    SUPER_CHARGE: int = 20
    MAX_ENERGY_LEVEL: int = 1000

    # World constants
    WORLD_MIN: int = 3
    WORLD_MAX: int = 30

    # Game constants
    DEFAULT_MAX_ROUNDS: int = 1000
    MESSAGE_HISTORY_LIMIT: int = 5
    MAX_TURN_TIME_LIMIT: float = 1.0

    # Points constants
    SURVIVOR_SAVE_ALIVE_SCORE: int = 100
    SURVIVOR_SAVE_DEAD_SCORE: int = 50
    PRED_CORRECT_SCORE: int = 10

    # Energy constants
    OBSERVE_ENERGY_COST: int = 1
    SAVE_ENERGY_COST: int = 1
    PREDICTION_ENERGY_COST: int = 1
    MOVE_ENERGY_COST: int = 1
    DRONE_SCAN_ENERGY_COST: int = 2

    # Directives constants
    MAX_DIRECTIVES: int = 5

    # Symbol prediction constants
    NUM_OF_TESTING_IMAGES: int = 704

    # Other
    DRONE_SCAN_DURATION: int = 5
