import os
import random
import sys
from typing import override

import numpy as np
import tensorflow as tf
from numpy.typing import NDArray

from agent.base_agent import BaseAgent
from agent.brain import Brain
from agent.log_levels import LogLevels
from aegis.common import Direction, Location
from aegis.common.commands.agent_command import AgentCommand
from aegis.common.commands.agent_commands import END_TURN, MOVE, PREDICT, SAVE_SURV
from aegis.common.commands.aegis_commands import (
    CONNECT_OK,
    FWD_MESSAGE,
    MOVE_RESULT,
    OBSERVE_RESULT,
    PREDICT_RESULT,
    SAVE_SURV_RESULT,
    SLEEP_RESULT,
    TEAM_DIG_RESULT,
)


class PredictingAgent(Brain):
    def __init__(self) -> None:
        super().__init__()
        random.seed(12345)
        self._random = random
        self._round = 1
        self._agent = BaseAgent.get_base_agent()
        self._model_path = os.path.join(os.path.dirname(__file__), "model.keras")
        # self._model = self._load_model()

        self._list: list[AgentCommand] = []
        self._commands_list_idx = 0
        self._list.append(SAVE_SURV())

    def _load_model(self):
        if os.path.isfile(self._model_path):
            _ = sys.stdout.flush()
            model = tf.keras.models.load_model(self._model_path)
            return model
        else:
            raise FileNotFoundError(f"Model file {self._model_path} not found.")

    @override
    def handle_connect_ok(self, connect_ok: CONNECT_OK) -> None:
        BaseAgent.log(LogLevels.Always, "CONNECT_OK")

    @override
    def handle_disconnect(self) -> None:
        BaseAgent.log(LogLevels.Always, "DISCONNECT")

    @override
    def handle_dead(self) -> None:
        BaseAgent.log(LogLevels.Always, "DEAD")

    @override
    def handle_fwd_message(self, msg: FWD_MESSAGE) -> None:
        BaseAgent.log(LogLevels.Always, f"FWD MESSAGE: {msg}")
        BaseAgent.log(LogLevels.Test, f"{msg}")

    @override
    def handle_move_result(self, mr: MOVE_RESULT) -> None:
        BaseAgent.log(LogLevels.Always, f"MOVE_RESULT: {mr}")
        BaseAgent.log(LogLevels.Test, f"{mr}")

    @override
    def handle_observe_result(self, ovr: OBSERVE_RESULT) -> None:
        BaseAgent.log(LogLevels.Always, f"OBSERVER_RESULT: {ovr}")
        BaseAgent.log(LogLevels.Always, f"{ovr.energy_level}")
        BaseAgent.log(LogLevels.Always, f"{ovr.life_signals}")
        BaseAgent.log(LogLevels.Always, f"{ovr.grid_info}")
        BaseAgent.log(LogLevels.Test, f"{ovr}")

    @override
    def handle_save_surv_result(self, ssr: SAVE_SURV_RESULT) -> None:
        BaseAgent.log(LogLevels.Always, f"SAVE_SURV_RESULT: {ssr}")
        BaseAgent.log(LogLevels.Test, f"{ssr}")

    @override
    def handle_predict_result(self, prd: PREDICT_RESULT) -> None:
        BaseAgent.log(LogLevels.Always, f"PREDICTION_RESULT: {prd}")
        BaseAgent.log(LogLevels.Test, f"{prd}")

    @override
    def handle_sleep_result(self, sr: SLEEP_RESULT) -> None:
        BaseAgent.log(LogLevels.Always, f"SLEEP_RESULT: {sr}")
        BaseAgent.log(LogLevels.Test, f"{sr}")

    @override
    def handle_team_dig_result(self, tdr: TEAM_DIG_RESULT) -> None:
        BaseAgent.log(LogLevels.Always, f"TEAM_DIG_RESULT: {tdr}")
        BaseAgent.log(LogLevels.Test, f"{tdr}")

    @override
    def think(self) -> None:
        BaseAgent.log(LogLevels.Always, "Thinking")

        command: AgentCommand
        if (
            self._agent.get_prediction_info_size() > 0
        ):  # something in here means we can make a prediction!
            print("\t\t ||||||||||||| Predicting ||||||||||||||||")
            surv_id, image, labels = self._agent.get_prediction_info()
            # BaseAgent.log(LogLevels.Always, f"Predicting (from labels: {labels})")
            # if image is not None:
            #     predicted_label: np.int64 = self._predict(image)
            #     command = PREDICT(surv_id, predicted_label)
            # else:
            #     # BaseAgent.log(LogLevels.Always, "No image to predict! (probably a bug!!!!!)")
            #     command = self._choose_random_command()
        # else:
        #     command = self._choose_random_command()

        command = self._choose_random_command()

        self._execute_command(command)
        self._round += 1

    def _random_location(self) -> Location:
        world = self.get_world()
        if world:
            width = len(world.get_world_grid()[0])
            height = len(world.get_world_grid())
            x = self._random.randint(0, width - 1)
            y = self._random.randint(0, height - 1)
            return Location(x, y)
        return Location(0, 0)

    def _random_move(self) -> MOVE:
        direction = self.get_direction(self._random.randint(0, 8))
        return MOVE(direction)

    def _choose_random_command(self) -> AgentCommand:
        res = self._list[self._commands_list_idx % len(self._list)]
        self._commands_list_idx += 1
        return res

    def _execute_command(self, command: AgentCommand) -> None:
        # BaseAgent.log(LogLevels.Always, f"Executing command: {command}")
        self._agent.send(command)
        self._agent.send(END_TURN())

    def _predict(self, image: NDArray[np.float32]) -> np.int64:
        expected_shape = (28, 28)
        if image.shape != expected_shape:
            image = np.reshape(image, expected_shape)
        image = np.expand_dims(image, axis=0)

        # print(f"Reshaped image shape: {image.shape}")
        # print(f"Image dtype: {image.dtype}")

        prediction = self._model.predict(image, verbose=0)
        return np.argmax(prediction)

    @staticmethod
    def get_direction(index: int) -> Direction:
        directions = [
            Direction.CENTER,
            Direction.NORTH,
            Direction.NORTH_EAST,
            Direction.EAST,
            Direction.SOUTH_EAST,
            Direction.SOUTH,
            Direction.SOUTH_WEST,
            Direction.WEST,
            Direction.NORTH_WEST,
        ]
        return directions[index] if 0 <= index < len(directions) else Direction.UNKNOWN
