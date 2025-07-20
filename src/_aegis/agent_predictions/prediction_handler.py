import importlib.resources
import random
from typing import cast

import numpy as np
from numpy.typing import NDArray

from _aegis.agent_predictions import model_testing_data
from _aegis.constants import Constants


class PredictionHandler:
    def __init__(self) -> None:
        # INFO: (gid, survivor_id), ([agent(s) helped save], idx for img/label)
        self._no_pred_yet: dict[tuple[int, int], tuple[list[AgentID], int]] = {}

        # INFO: gid, {survivor_id: (agent_id, prediction_correct)}
        self._pred_results: dict[int, dict[int, tuple[int, bool]]] = {}

        with (
            importlib.resources.path(model_testing_data, "x_test_a3.npy") as x_path,
            importlib.resources.path(model_testing_data, "y_test_a3.npy") as y_path,
        ):
            self._x_test: NDArray[np.float32] = np.load(x_path)
            self._y_test: NDArray[np.int64] = np.load(y_path)
            self._unique_labels: NDArray[np.int64] = np.unique(self._y_test)

    def get_image_from_index(self, index: int) -> NDArray[np.float32]:
        return cast("NDArray[np.float32]", self._x_test[index])

    def get_label_from_index(self, index: int) -> int:
        return cast("int", self._y_test[index])

    def is_group_in_no_pred_yet(self, gid: int, survivor_id: int) -> bool:
        return (gid, survivor_id) in self._no_pred_yet

    def is_agent_in_saving_group(self, agent_id: AgentID, survivor_id: int) -> bool:
        key = (agent_id.gid, survivor_id)
        agents, _ = self._no_pred_yet.get(key, ([], -1))
        return agent_id in agents

    def add_agent_to_no_pred_yet(self, agent_id: AgentID, survivor_id: int) -> None:
        key = (agent_id.gid, survivor_id)
        if key in self._no_pred_yet:
            self._no_pred_yet[key][0].append(agent_id)
        else:
            random_index = random.randint(0, Constants.NUM_OF_TESTING_IMAGES - 1)
            self._no_pred_yet[key] = ([agent_id], random_index)

    def _remove_group_surv_from_no_pred_yet(self, gid: int, survivor_id: int) -> None:
        _ = self._no_pred_yet.pop((gid, survivor_id), None)

    def get_pred_info_for_agent(
        self, agent_id: AgentID
    ) -> tuple[int, NDArray[np.float32], NDArray[np.int64]] | None:
        # find agent in a list of agent(s) helped saved and
        # return pred_info for it, otherwise return None
        for (gid, surv_id), (agents, idx) in self._no_pred_yet.items():
            if agent_id.gid == gid and agent_id in agents:
                return surv_id, self._x_test[idx], self._unique_labels
        return None

    def check_agent_prediction(
        self, agent_id: AgentID, survivor_id: int, label: np.int64
    ) -> bool:
        key = (agent_id.gid, survivor_id)
        _, idx = self._no_pred_yet.get(key, ([], -1))
        if idx == -1:
            return False
        return cast("int", self._y_test[idx]) == label

    def set_prediction_result(
        self, agent_id: AgentID, survivor_id: int, *, prediction_correct: bool
    ) -> None:
        gid = agent_id.gid
        self._pred_results.setdefault(gid, {})[survivor_id] = (
            agent_id.id,
            prediction_correct,
        )
        self._remove_group_surv_from_no_pred_yet(gid, survivor_id)

    def get_prediction_result(self, agent_id: AgentID) -> tuple[int, bool] | None:
        preds = self._pred_results.get(agent_id.gid, {})
        for surv_id, (responsible_id, correct) in preds.items():
            if responsible_id == agent_id.gid:
                return surv_id, correct
        return None
