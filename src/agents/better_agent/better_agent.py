import os
from typing import override

import numpy as np

os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"

import tensorflow as tf  # pyright: ignore[reportMissingTypeStubs]
from aegis import (
    CONNECT_OK,
    END_TURN,
    FWD_MESSAGE,
    MOVE,
    MOVE_RESULT,
    OBSERVE_RESULT,
    PREDICT,
    PREDICT_RESULT,
    SAVE_SURV,
    SAVE_SURV_RESULT,
    SLEEP_RESULT,
    TEAM_DIG,
    TEAM_DIG_RESULT,
    AgentCommand,
    Direction,
    Location,
    SurroundInfo,
    Survivor,
    World,
)
from agent.base_agent import BaseAgent
from agent.brain import Brain
from agent.log_levels import LogLevels
from agents.better_agent.pathfinder import Pathfinder
from numpy.typing import NDArray


class BetterAgent(Brain):
    def __init__(self) -> None:
        super().__init__()
        self._round = 1
        self._agent = BaseAgent.get_base_agent()
        self._model = self._load_model()  # pyright: ignore[reportUnknownMemberType]

    def _load_model(self):  # pyright: ignore[reportUnknownParameterType]
        model_path = os.path.join(os.path.dirname(__file__), "model_mnist.keras")
        if os.path.isfile(model_path):
            model = tf.keras.models.load_model(model_path)  # pyright: ignore[reportUnknownVariableType, reportUnknownMemberType, reportAttributeAccessIssue]
            return model  # pyright: ignore[reportUnknownVariableType]
        else:
            raise FileNotFoundError(f"Model file {model_path} not found.")

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
        self.update_surround(mr.surround_info)

    @override
    def handle_observe_result(self, ovr: OBSERVE_RESULT) -> None:
        world = self.get_world()
        if world is None:
            return

        loc = ovr.cell_info.location
        cell = world.get_cell_at(loc)
        if cell is None:
            return

        cell.set_top_layer(ovr.cell_info.top_layer)

    @override
    def handle_save_surv_result(self, ssr: SAVE_SURV_RESULT) -> None:
        self.update_surround(ssr.surround_info)

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
        self.update_surround(tdr.surround_info)

    @override
    def think(self) -> None:
        BaseAgent.log(LogLevels.Always, "Thinking")

        # Send a Direction.CENTER to get surrounding info to start pathfinding.
        if self._round == 1:
            self.send_and_end_turn(MOVE(Direction.CENTER))
            return

        world = self.get_world()
        if world is None:
            return

        if self._agent.get_prediction_info_size() > 0:
            surv_id, image, _ = self._agent.get_prediction_info()
            if image is not None:
                predicted_label = self._predict(image)
                self.send_and_end_turn(PREDICT(surv_id, predicted_label))
                return

        loc = self.get_best_location(world)
        if loc == self._agent.get_location():
            cell = world.get_cell_at(loc)
            if cell is None:
                return

            top_layer = cell.get_top_layer()
            if top_layer is None:
                cell.survivor_chance = 0
                loc = self.get_best_location(world)
                self.send_and_end_turn(self.move(world, loc))
                return

            if isinstance(top_layer, Survivor):
                self.send_and_end_turn(SAVE_SURV())
            else:
                self.send_and_end_turn(TEAM_DIG())
            return

        self.send_and_end_turn(self.move(world, loc))

    def send_and_end_turn(self, command: AgentCommand):
        BaseAgent.log(LogLevels.Always, f"SENDING {command}")
        self._agent.send(command)
        self._agent.send(END_TURN())
        self._round += 1

    def move(self, world: World, loc: Location) -> MOVE:
        dir = Pathfinder().a_star(world, self._agent, self._agent.get_location(), loc)
        return MOVE(dir)

    def get_best_location(self, world: World) -> Location:
        best_cell = world.get_world_grid()[0][0]
        for x in range(world.width):
            for y in range(world.height):
                cell = world.get_cell_at(Location(x, y))
                if cell is None:
                    continue

                if cell.survivor_chance > best_cell.survivor_chance:
                    best_cell = cell

        return best_cell.location

    def update_surround(self, surround_info: SurroundInfo):
        world = self.get_world()
        if world is None:
            return

        for dir in Direction:
            cell_info = surround_info.get_surround_info(dir)
            if cell_info is None:
                continue

            cell = world.get_cell_at(cell_info.location)
            if cell is None:
                continue

            cell.move_cost = cell_info.move_cost
            cell.set_top_layer(cell_info.top_layer)

    def _predict(self, image: NDArray[np.float32]) -> np.int64:
        expected_shape = (28, 28)
        if image.shape != expected_shape:
            image = np.reshape(image, expected_shape)
        image = np.expand_dims(image, axis=0)

        prediction = self._model.predict(image, verbose=0)  # pyright: ignore[reportUnknownMemberType, reportUnknownVariableType]
        return np.argmax(prediction)  # pyright: ignore[reportUnknownArgumentType]
