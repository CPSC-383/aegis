from typing import override

from ..aegis_command import AegisCommand


class RECHARGE_RESULT(AegisCommand):
    def __init__(self, was_successful: bool, charge_energy: int) -> None:
        self.was_successful: bool = was_successful
        self.charge_energy: int = charge_energy

    @override
    def __str__(self) -> str:
        return f"{self.STR_RECHARGE_RESULT} ( RESULT {str(self.was_successful).upper()} , CH_ENG {self.charge_energy} )"

    @override
    def __repr__(self) -> str:
        return self.__str__()
