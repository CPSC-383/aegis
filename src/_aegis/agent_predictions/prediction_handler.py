import importlib.resources
import random
from typing import Any, cast

from _aegis.conditional_imports import get_numpy, is_prediction_available
from _aegis.constants import Constants
from _aegis.team import Team

# Get numpy conditionally
np = get_numpy()


class PredictionHandler:
    def __init__(self) -> None:
        if not is_prediction_available():
            msg = "Predictions not available - numpy or prediction data missing"
            raise RuntimeError(msg)

        # INFO: (team, survivor_id), ([agent_ids that helped save], idx for img/label)
        self._no_pred_yet: dict[tuple[Team, int], tuple[list[int], int]] = {}

        # INFO: team, {survivor_id: (agent_id, prediction_correct)}
        self._pred_results: dict[Team, dict[int, tuple[int, bool]]] = {}

        try:
            from _aegis.agent_predictions import model_testing_data  # noqa: PLC0415

            with (
                importlib.resources.path(model_testing_data, "x_test_a3.npy") as x_path,
                importlib.resources.path(model_testing_data, "y_test_a3.npy") as y_path,
            ):
                self._x_test: Any = np.load(x_path)
                self._y_test: Any = np.load(y_path)
                self._unique_labels: Any = np.unique(self._y_test)
        except (ImportError, FileNotFoundError) as e:
            error_msg = f"Failed to load prediction data: {e}"
            raise RuntimeError(error_msg) from e

    def get_image_from_index(self, index: int) -> Any:  # noqa: ANN401
        return cast("Any", self._x_test[index])

    def get_label_from_index(self, index: int) -> int:
        return cast("int", self._y_test[index])

    def is_team_in_no_pred_yet(self, team: Team, survivor_id: int) -> bool:
        return (team, survivor_id) in self._no_pred_yet

    def is_agent_in_saving_group(
        self, agent_id: int, team: Team, survivor_id: int
    ) -> bool:
        key = (team, survivor_id)
        agent_ids, _ = self._no_pred_yet.get(key, ([], -1))
        return agent_id in agent_ids

    def add_agent_to_no_pred_yet(
        self, agent_id: int, team: Team, survivor_id: int
    ) -> None:
        key = (team, survivor_id)
        if key in self._no_pred_yet:
            self._no_pred_yet[key][0].append(agent_id)
        else:
            random_index = random.randint(0, Constants.NUM_OF_TESTING_IMAGES - 1)
            self._no_pred_yet[key] = ([agent_id], random_index)

    def _remove_team_surv_from_no_pred_yet(self, team: Team, survivor_id: int) -> None:
        _ = self._no_pred_yet.pop((team, survivor_id), None)

    def get_pred_info_for_agent(
        self, agent_id: int, team: Team
    ) -> tuple[int, Any, Any] | None:
        # find agent in a list of agent(s) helped saved and
        # return pred_info for it, otherwise return None
        for (team_key, surv_id), (agent_ids, idx) in self._no_pred_yet.items():
            if team_key == team and agent_id in agent_ids:
                return surv_id, self._x_test[idx], self._unique_labels
        return None

    def check_agent_prediction(
        self,
        agent_id: int,  # noqa: ARG002
        team: Team,
        survivor_id: int,
        label: Any,  # noqa: ANN401
    ) -> bool:
        key = (team, survivor_id)
        _, idx = self._no_pred_yet.get(key, ([], -1))
        if idx == -1:
            return False
        return cast("int", self._y_test[idx]) == label

    def set_prediction_result(
        self, agent_id: int, team: Team, survivor_id: int, *, prediction_correct: bool
    ) -> None:
        self._pred_results.setdefault(team, {})[survivor_id] = (
            agent_id,
            prediction_correct,
        )
        self._remove_team_surv_from_no_pred_yet(team, survivor_id)

    def get_prediction_result(
        self, agent_id: int, team: Team
    ) -> tuple[int, bool] | None:
        preds = self._pred_results.get(team, {})
        for surv_id, (responsible_id, correct) in preds.items():
            if responsible_id == agent_id:
                return surv_id, correct
        return None
