from __future__ import annotations

from typing import override


class AgentID:
    def __init__(self, agent_id: int, gid: int) -> None:
        self.id: int = agent_id
        self.gid: int = gid

    @override
    def __str__(self) -> str:
        return f"[ ID {self.id} , GID {self.gid} ]"

    @override
    def __repr__(self) -> str:
        return self.__str__()

    @override
    def __hash__(self) -> int:
        hash_code = 3
        hash_code = 89 * hash_code + self.id
        return 89 * hash_code + self.gid

    @override
    def __eq__(self, other: object) -> bool:
        if isinstance(other, AgentID):
            return other.id == self.id and other.gid == self.gid
        return False

    @override
    def __ne__(self, other: object) -> bool:
        if isinstance(other, AgentID):
            return not self.__eq__(other)
        return False

    def __lt__(self, other: object) -> bool:
        if isinstance(other, AgentID):
            if self.gid < other.gid:
                return True
            if self.gid == other.gid:
                return self.id < other.id
        return False

    def __gt__(self, other: object) -> bool:
        if isinstance(other, AgentID):
            if self.gid > other.gid:
                return True
            if self.gid == other.gid:
                return self.id > other.id
        return False

    def __le__(self, other: object) -> bool:
        if isinstance(other, AgentID):
            return self.__lt__(other) or self.__eq__(other)
        return False

    def __ge__(self, other: object) -> bool:
        if isinstance(other, AgentID):
            return self.__gt__(other) or self.__eq__(other)
        return False
