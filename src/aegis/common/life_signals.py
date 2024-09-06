from typing import override

from aegis.common.utility import Utility


class LifeSignals:
    """
    Represents a collection of life signals.

    Attributes:
        life_signals (list[int]): A list of life signals.
    """

    def __init__(self, life_signals: list[int] | None = None) -> None:
        """
        Initializes a LifeSignals instance.

        Args:
            life_signals: A list of life signals.
        """
        self.life_signals = life_signals or []

    def size(self) -> int:
        """Returns the number of life signals."""
        return len(self.life_signals)

    def get(self, index: int) -> int:
        """
        Retrieves the life signal at the specified index.

        Args:
            index: The index of the life signal to retrieve.
        """
        return self.life_signals[index]

    @override
    def __str__(self) -> str:
        return f"( {' , '.join(str(signal) for signal in self.life_signals)} )"

    def distort(self, factor: int) -> None:
        for i in range(len(self.life_signals)):
            value = Utility.random_in_range(0, factor)
            if value > self.life_signals[i]:
                self.life_signals[i] = 0
            else:
                self.life_signals[i] -= value
