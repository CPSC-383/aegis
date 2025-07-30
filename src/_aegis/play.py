from pathlib import Path

from .args_parser import Args
from .game import Game
from .game_pb import GamePb
from .logger import LOGGER, setup_console_and_file_logging, setup_console_logging
from .server_websocket import WebSocketServer
from .team import Team
from .world_parser import load_world


def run(args: Args) -> None:
    ws_server = WebSocketServer(wait_for_client=args.client)
    game_pb = GamePb()
    game_pb.make_games_header(ws_server)

    # Set up logging based on whether file logging is enabled
    if args.log:
        setup_console_and_file_logging()
    else:
        setup_console_logging()

    if args.agent1 is None and args.agent2 is None:
        error = "At least one agent must be provided"
        raise ValueError(error)

    world = load_world(Path(args.world))
    if world is None:
        error = f"Unable to parse world file from '{args.world}'"
        raise ValueError(error)

    world.rounds = args.rounds

    game = Game(args, world, game_pb)

    LOGGER.info("========== AEGIS SIMULATION START ==========")
    LOGGER.info("Running %d rounds", world.rounds)
    print()  # noqa: T201
    ws_server.start()

    game_pb.make_game_header(world)
    while game.running:
        try:
            game.run_round()
        except Exception:  # noqa: BLE001
            LOGGER.exception("This shouldn't have happened.")
            game.running = False

    # game footer will be inside outer for loops of worlds later
    game_pb.make_game_footer()
    game_pb.make_games_footer()
    ws_server.finish()
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
