from collections import deque

from .constants import Constants
from .message import Message


class MessageBuffer:
    """Maintains a limited history of messages grouped by round."""

    def __init__(self) -> None:
        self._history: deque[int] = deque(maxlen=Constants.MESSAGE_HISTORY_LIMIT)
        self._round_map: dict[int, list[Message]] = {}

    def add_message(self, message: Message) -> None:
        """
        Add a message to the buffer, indexed by its round number.

        If the round is new, older data may be dropped to maintain size limits.

        Args:
            message (Message): The message to store.

        """
        if message.round_num not in self._round_map:
            self._rotate_to(message.round_num)
        self._round_map[message.round_num].append(message)

    def _rotate_to(self, new_round: int) -> None:
        """
        Prepare the buffer to store messages for a new round.

        If the maximum history size is reached, the oldest round's messages
        are discarded.

        Args:
            new_round (int): The new round to initialize in the buffer.

        """
        if (
            self._history.maxlen is not None
            and len(self._history) == self._history.maxlen
        ):
            oldest = self._history.popleft()
            del self._round_map[oldest]
        self._history.append(new_round)
        self._round_map[new_round] = []

    def get_all_messages(self) -> list[Message]:
        """
        Retrieve all messages from the buffer.

        Messages are returned in reverse-chronological order: newest round's
        messages first, oldest last.

        Returns:
            list[Message]: All stored messages, sorted by most recent round.

        """
        result: list[Message] = []
        for r in reversed(self._history):
            result.extend(self._round_map[r])
        return result

    def get_messages(self, round_num: int) -> list[Message]:
        """
        Retrieve messages from a specific round.

        Args:
            round_num (int): The round to fetch messages for.

        Returns:
            list[Message]: A copy of the messages from the round,
            or an empty list if not stored.

        """
        return list(self._round_map.get(round_num, []))

    def next_round(self, round_num: int) -> None:
        """
        Start a new round.

        Args:
            round_num (int): The round number to begin.

        """
        self._rotate_to(round_num)
