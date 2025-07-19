from dataclasses import dataclass

from .helper.cell_info_settings import CellInfoSettings
from .helper.cell_type_info import CellTypeInfo


@dataclass
class AegisWorldFile:
    width: int
    height: int
    start_energy: int
    random_seed: int
    cells: list[CellInfoSettings]
    special_cells: list[CellTypeInfo]
