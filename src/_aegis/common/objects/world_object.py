from __future__ import annotations

from abc import ABC, abstractmethod
from typing import TYPE_CHECKING, override

if TYPE_CHECKING:
    from _aegis.types.world import Layer


class WorldObject(ABC):
    def __init__(self) -> None:
        self.id: int = -1

    @abstractmethod
    @override
    def __str__(self) -> str:
        pass

    @abstractmethod
    def json(self) -> Layer:
        pass
