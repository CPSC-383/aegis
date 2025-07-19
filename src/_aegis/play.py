from pathlib import Path

# from .game import Game
from .parsers.args_parser import Args
from .world_parser import load_world


def run(args: Args) -> None:
    world = load_world(Path(args.world))
    if world is None:
        error = f"Unable to parse world file from '{args.world}'"
        raise ValueError(error)

    # game = Game(args)
