from __future__ import annotations

from enum import Enum


class Team(Enum):
    GOOBS = 0
    VOIDSEERS = 1

    def opponent(self) -> Team:
        return Team.VOIDSEERS if self == Team.GOOBS else Team.GOOBS
