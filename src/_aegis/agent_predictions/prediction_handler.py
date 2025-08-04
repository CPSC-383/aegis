import random
from typing import Any, cast

from _aegis.conditional_imports import is_prediction_available
from _aegis.constants import Constants
from _aegis.team import Team
from _aegis.types.prediction import (
    PredictionData,
    PredictionLabel,
    PredictionResult,
    SurvivorID,
)

from .data_loader import PredictionDataLoader

TeamSurvivorKey = tuple[Team, SurvivorID]
TeamPredictionResults = dict[SurvivorID, PredictionResult]
NoPredictionYet = dict[TeamSurvivorKey, PredictionData]
AllPredictionResults = dict[Team, TeamPredictionResults]


class PredictionHandler:
    def __init__(self, testing_for_marking: bool = False) -> None:
        # Prediction handler always works now

        # Track survivors that haven't been predicted yet
        self._no_pred_yet: NoPredictionYet = {}

        # Track prediction results for each team
        self._pred_results: AllPredictionResults = {}

        # Initialize data loader
        self._data_loader = PredictionDataLoader(
            testing_for_marking=testing_for_marking
        )

    def get_image_from_index(self, index: int) -> Any:  # noqa: ANN401
        return cast("Any", self._data_loader.x_test[index])

    def get_label_from_index(self, index: int) -> PredictionLabel:
        return cast("PredictionLabel", self._data_loader.y_test[index])

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
            random_index = random.randint(0, self._data_loader.num_testing_images - 1)
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
                    self._data_loader.x_test[prediction_data["image_index"]],
                    self._data_loader.unique_labels,
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
            cast(
                "PredictionLabel",
                self._data_loader.y_test[prediction_data["image_index"]],
            )
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
