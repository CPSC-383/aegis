import importlib.resources
import random
from typing import Any, cast

from _aegis.conditional_imports import get_numpy, is_prediction_available
from _aegis.constants import Constants
from _aegis.team import Team
from _aegis.types.prediction import (
    PredictionData,
    PredictionLabel,
    PredictionResult,
    SurvivorID,
)

np = get_numpy()

TeamSurvivorKey = tuple[Team, SurvivorID]
TeamPredictionResults = dict[SurvivorID, PredictionResult]
NoPredictionYet = dict[TeamSurvivorKey, PredictionData]
AllPredictionResults = dict[Team, TeamPredictionResults]


class PredictionHandler:
    def __init__(self) -> None:
        if not is_prediction_available():
            msg = "Predictions not available - numpy or prediction data missing"
            raise RuntimeError(msg)

        # Track survivors that haven't been predicted yet
        self._no_pred_yet: NoPredictionYet = {}

        # Track prediction results for each team
        self._pred_results: AllPredictionResults = {}

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

    def get_label_from_index(self, index: int) -> PredictionLabel:
        return cast("PredictionLabel", self._y_test[index])

    def is_team_in_no_pred_yet(self, team: Team, survivor_id: SurvivorID) -> bool:
        key: TeamSurvivorKey = (team, survivor_id)
        return key in self._no_pred_yet

    def is_agent_in_saving_group(
        self, agent_id: int, team: Team, survivor_id: SurvivorID
    ) -> bool:
        key: TeamSurvivorKey = (team, survivor_id)
        prediction_data = self._no_pred_yet.get(key)
        if prediction_data is None:
            return False
        return agent_id in prediction_data["agent_group"]

    def add_agent_to_no_pred_yet(
        self, agent_id: int, team: Team, survivor_id: SurvivorID
    ) -> None:
        key: TeamSurvivorKey = (team, survivor_id)
        if key in self._no_pred_yet:
            self._no_pred_yet[key]["agent_group"].append(agent_id)
        else:
            random_index = random.randint(0, Constants.NUM_OF_TESTING_IMAGES - 1)
            prediction_data: PredictionData = {
                "agent_group": [agent_id],
                "image_index": random_index,
            }
            self._no_pred_yet[key] = prediction_data

    def _remove_team_surv_from_no_pred_yet(
        self, team: Team, survivor_id: SurvivorID
    ) -> None:
        key: TeamSurvivorKey = (team, survivor_id)
        _ = self._no_pred_yet.pop(key, None)

    def get_pred_info_for_agent(
        self, agent_id: int, team: Team
    ) -> tuple[SurvivorID, Any, Any] | None:
        # find agent in a list of agent(s) helped saved and
        # return pred_info for it, otherwise return None
        for (team_key, surv_id), prediction_data in self._no_pred_yet.items():
            if team_key == team and agent_id in prediction_data["agent_group"]:
                return (
                    surv_id,
                    self._x_test[prediction_data["image_index"]],
                    self._unique_labels,
                )
        return None

    def check_agent_prediction(
        self,
        agent_id: int,  # noqa: ARG002
        team: Team,
        survivor_id: SurvivorID,
        label: PredictionLabel,
    ) -> bool:
        key: TeamSurvivorKey = (team, survivor_id)
        prediction_data = self._no_pred_yet.get(key)
        if prediction_data is None:
            return False
        return (
            cast("PredictionLabel", self._y_test[prediction_data["image_index"]])
            == label
        )

    def set_prediction_result(
        self,
        agent_id: int,
        team: Team,
        survivor_id: SurvivorID,
        *,
        prediction_correct: bool,
    ) -> None:
        prediction_result: PredictionResult = {
            "agent_id": agent_id,
            "prediction_correct": prediction_correct,
        }
        self._pred_results.setdefault(team, {})[survivor_id] = prediction_result
        self._remove_team_surv_from_no_pred_yet(team, survivor_id)

    def get_prediction_result(
        self, agent_id: int, team: Team
    ) -> tuple[SurvivorID, bool] | None:
        preds = self._pred_results.get(team, {})
        for surv_id, prediction_result in preds.items():
            if prediction_result["agent_id"] == agent_id:
                return surv_id, prediction_result["prediction_correct"]
        return None
