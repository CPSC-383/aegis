import re
from typing import TextIO

from ..aegis_config import is_feature_enabled
from ..parsers.aegis_parser_exception import AegisParserException
from ..common.world.cell import Cell


class AegisParser:
    @staticmethod
    def build_world(file_location: str) -> list[list[Cell]] | None:
        world: list[list[Cell]] | None = None
        try:
            with open(file_location) as file:
                world = AegisParser.read_world_size(file)
                for line in file:
                    cell = AegisParser.read_and_build_cell(line)
                    world[cell.location.x][cell.location.y] = cell
        except FileNotFoundError:
            raise AegisParserException(
                f"Unable to find startup world information file from {file_location}"
            )
        except Exception:
            raise AegisParserException(
                f"Unable to read in startup world information file from {file_location}"
            )
        return world

    @staticmethod
    def read_world_size(file: TextIO) -> list[list[Cell]]:
        tokens = file.readline().split()
        width = int(tokens[3])
        height = int(tokens[6])
        return [[None] * height for _ in range(width)]  # pyright: ignore[reportReturnType]

    @staticmethod
    def read_and_build_cell(line: str) -> Cell:
        pattern = r"[\[\]\(\),% ]"
        tokens = re.split(pattern, line.strip())
        tokens = [token for token in tokens if token]
        x = int(tokens[0])
        y = int(tokens[1])
        killer = tokens[2]
        charging = tokens[3]
        cell = Cell(x, y)

        cell.set_normal_cell()
        if killer[0] == "+":
            cell.set_killer_cell()

        if charging[0] == "+":
            cell.set_charging_cell()

        if is_feature_enabled("ENABLE_MOVE_COST"):
            cell.move_cost = int(tokens[4])
        return cell
