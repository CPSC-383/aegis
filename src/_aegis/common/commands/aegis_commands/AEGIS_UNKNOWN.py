from typing import override

from ..aegis_command import AegisCommand


class AEGIS_UNKNOWN(AegisCommand):
    @override
    def __str__(self) -> str:
        return self.STR_UNKNOWN

    @override
    def __repr__(self) -> str:
        return self.__str__()
