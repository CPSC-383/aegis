from pathlib import Path

from .args_parser import Args
from .game import Game
from .logger import LOGGER
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

    while game.running:
        try:
            game.run_round()
        except Exception:  # noqa: BLE001
            LOGGER.exception("idk what happened")

    LOGGER.info("Results for each team")
    LOGGER.info("(Score, Number Saved, Correct Predictions)")
    LOGGER.info("=================================================")
    # for group in self.agent_group_list:
    #     LOGGER.info(
    #         "%s : (%s, %s, %s)",
    #         group.name,
    #         group.score,
    #         group.number_saved,
    #         group.number_predicted_right,
    #     )
