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
    LOGGER.info(f"{'Team':<12} {'Score':>8} {'Saved':>8} {'Predictions':>14}")
    LOGGER.info("-" * 58)
    for team in Team:
        if team == Team.VOIDSEERS and args.agent2 is None:
            continue
        score = game.team_info.get_score(team)
        saved = game.team_info.get_saved(team)
        predictions = game.team_info.get_predicted_right(team)

        LOGGER.info(f"{team.name:<12} {score:>8} {saved:>8} {predictions:>14}")
