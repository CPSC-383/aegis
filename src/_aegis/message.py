from typing import override


class Message:
    def __init__(self, message: str, round_num: int, sender_id: int) -> None:
        self.message: str = message
        self.round_num: int = round_num
        self.sender_id: int = sender_id

    @override
    def __str__(self) -> str:
        return f'Msg from Agent#{self.sender_id} at round {self.round_num}: "{self.message}"'

    @override
    def __repr__(self) -> str:
        return self.__str__()
