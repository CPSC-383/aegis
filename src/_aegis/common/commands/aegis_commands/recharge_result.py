from typing import override

from _aegis.common.commands.aegis_command import AegisCommand


class RechargeResult(AegisCommand):
    def __init__(self, charge_energy: int, *, was_successful: bool) -> None:
        self.was_successful: bool = was_successful
        self.charge_energy: int = charge_energy

    @override
    def __str__(self) -> str:
        return (
            f"{self.STR_RECHARGE_RESULT} ( RESULT {str(self.was_successful).upper()} , "
            f"CH_ENG {self.charge_energy} )"
        )

    @override
    def __repr__(self) -> str:
        return self.__str__()
