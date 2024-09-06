from abc import ABC, abstractmethod
from typing import override


class WorldObjectInfo(ABC):
    """
    Represents information about a world object.

    Attributes:
        id (int): The id of the world object.
    """

    def __init__(self, id: int) -> None:
        """
        Initializes a WorldObjectInfo instance.

        Args:
            id: The id of the world object.
        """
        self.id = id

    @abstractmethod
    @override
    def __str__(self) -> str:
        pass

    @abstractmethod
    def distort_info(self, factor: int) -> None:
        """
        Applies distortion to the world object information.

        Args:
            factor: The maximum value of the random distortion.
        """
        pass
