from pathlib import Path

from .args_parser import Args
from .game import Game
from .logger import LOGGER
from .team import Team
from .world_parser import load_world


def run(args: Args) -> None:
    if args.agent1 is None and args.agent2 is None:
        error = "At least one agent must be provided"
        raise ValueError(error)

    world = load_world(Path(args.world))
    if world is None:
        error = f"Unable to parse world file from '{args.world}'"
        raise ValueError(error)

    world.rounds = args.rounds

    game = Game(args, world)
    game.ws_server.start()

    LOGGER.info("========== AEGIS SIMULATION START ==========")
    LOGGER.info("Running %d rounds", world.rounds)
    print()  # noqa: T201

    while game.running:
        try:
            game.run_round()
        except Exception:  # noqa: BLE001
            LOGGER.exception("This shouldn't have happened.")
            game.running = False

    LOGGER.info("========== AEGIS SIMULATION END ==========")
    LOGGER.info("Results for each team")
    LOGGER.info("(Score, Number Saved, Correct Predictions)")
    for team in Team:
        LOGGER.info(
            "%s : (%s, %s, %s)",
            team.name,
            game.team_info.get_score(team),
            game.team_info.get_saved(team),
            game.team_info.get_predicted_right(team),
        )
