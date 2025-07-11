from abc import ABC, abstractmethod

from _aegis.common.world.world import World


class Brain(ABC):
    """Represents the brain of an agent."""

    def __init__(self) -> None:
        self._world: World | None = None

    def get_world(self) -> World | None:
        return self._world

    def set_world(self, world: World) -> None:
        self._world = world

    # @abstractmethod
    # def handle_send_message_result(self, smr: SEND_MESSAGE_RESULT) -> None:
    #     pass
    #
    # @abstractmethod
    # def handle_save_surv_result(self, ssr: SAVE_SURV_RESULT) -> None:
    #     pass
    #
    # @abstractmethod
    # def handle_predict_result(self, prd: PREDICT_RESULT) -> None:
    #     pass
    #
    # @abstractmethod
    # def handle_observe_result(self, ovr: OBSERVE_RESULT) -> None:
    #     pass

    @abstractmethod
    def think(self) -> None:
        """
        Contains the logic for the brain to make decisions based
        on the current state of the world.
        """
        pass
