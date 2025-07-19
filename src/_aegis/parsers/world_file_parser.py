from pathlib import Path
from typing import cast

import yaml

from _aegis.common import Location

from .aegis_world_file import AegisWorldFile
from .helper.cell_info_settings import CellInfoSettings
from .helper.cell_type_info import CellTypeInfo
from .helper.world_file_type import (
    CellInfo,
    CellTypes,
    Loc,
    WorldFileType,
    WorldInfo,
)


class WorldFileParser:
    @staticmethod
    def parse_world_file(filename: Path) -> AegisWorldFile | None:
        try:
            with Path.open(filename) as file:
                data = cast("WorldFileType", yaml.safe_load(file))

                width, height, start_energy, seed = WorldFileParser._parse_info(
                    data["world_info"]
                )
                specials = WorldFileParser._parse_specials(data["special_cells"])
                cells = WorldFileParser._parse_cells(data["cells"])

                return AegisWorldFile(
                    width,
                    height,
                    start_energy,
                    seed,
                    cells,
                    specials,
                )
        except (FileNotFoundError, yaml.YAMLError, KeyError):
            return None

    @staticmethod
    def _parse_info(world_info: WorldInfo) -> tuple[int, int, int, int]:
        size = world_info["size"]
        return (
            size["width"],
            size["height"],
            world_info["start_energy"],
            world_info["seed"],
        )

    @staticmethod
    def _parse_cells(
        cell_stack_info: list[CellInfo],
    ) -> list[CellInfoSettings]:
        return [
            CellInfoSettings(
                cell["move_cost"],
                cell["layers"],
                Location(cell["loc"]["x"], cell["loc"]["y"]),
            )
            for cell in cell_stack_info
        ]

    @staticmethod
    def _parse_specials(cell_types: CellTypes) -> list[CellTypeInfo]:
        return [
            CellTypeInfo(
                name,
                [Location(loc["x"], loc["y"]) for loc in cast("list[Loc]", cell_locs)],
            )
            for name, cell_locs in cell_types.items()
        ]
