from __future__ import annotations

from abc import ABC, abstractmethod
from typing import override

from _aegis.parsers.helper.world_file_type import StackContent


class WorldObject(ABC):
    def __init__(self) -> None:
        self.id: int = -1

    @abstractmethod
    @override
    def __str__(self) -> str:
        pass

    @abstractmethod
    def json(self) -> StackContent:
        pass
