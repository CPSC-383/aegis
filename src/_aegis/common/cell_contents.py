from typing import override

from _aegis.common.objects import WorldObject


class CellContents:
    def __init__(self, layers: list[WorldObject], agents: list[int]) -> None:
        self.layers: list[WorldObject] = layers
        self.agents: list[int] = agents

    @override
    def __str__(self) -> str:
        return f"CellContents(layers={self.layers}, agents={self.agents})"

    @override
    def __repr__(self) -> str:
        return self.__str__()
