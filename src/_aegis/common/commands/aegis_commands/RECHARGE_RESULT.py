from typing import override

from _aegis.common.commands.aegis_command import AegisCommand


class RECHARGE_RESULT(AegisCommand):
    """
    Represents the result of the agent sleeping.

    Attributes:
        was_successful (bool): If the sleep was successful or not.
        charge_energy (int): The agents current energy level.
    """

    def __init__(self, was_successful: bool, charge_energy: int) -> None:
        """
        Initializes a RECHARGE_RESULT instance.

        Args:
            was_successful: If the sleep was successful or not.
            charge_energy: The agents current energy level.
        """
        self.was_successful: bool = was_successful
        self.charge_energy: int = charge_energy

    @override
    def __str__(self) -> str:
        return f"{self.STR_RECHARGE_RESULT} ( RESULT {str(self.was_successful).upper()} , CH_ENG {self.charge_energy} )"
