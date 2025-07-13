from abc import ABC, abstractmethod

from _aegis.common.world.objects import WorldObject
from _aegis.parsers.helper.world_file_type import Arguments


class ObjectHandler(ABC):
    def __init__(self) -> None:
        self.world_object_count: int = 0

    @abstractmethod
    def get_keys(self) -> list[str]:
        pass

    @abstractmethod
    def create_world_object(self, params: dict[Arguments, int]) -> WorldObject | None:
        pass

    @abstractmethod
    def reset(self) -> None:
        pass
