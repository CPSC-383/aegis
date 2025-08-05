import random
from typing import Any

from _aegis.args_parser import Args
from _aegis.logger import LOGGER
from _aegis.team import Team
from _aegis.types.prediction import (
    CompletedPrediction,
    PendingPrediction,
    PredictionLabel,
    SurvivorID,
)

from .data_loader import PredictionDataLoader

PendingPredictions = dict[tuple[Team, SurvivorID], PendingPrediction]
CompletedPredictions = dict[tuple[Team, SurvivorID], CompletedPrediction]


class PredictionHandler:
    def __init__(self, args: Args) -> None:
        self._pending_predictions: PendingPredictions = {}
        self._completed_predictions: CompletedPredictions = {}
        self._data_loader: PredictionDataLoader = PredictionDataLoader(args)

    def get_image_from_index(self, index: int) -> Any:  # noqa: ANN401
        return self._data_loader.x_test[index]

    def get_label_from_index(self, index: int) -> PredictionLabel:
        return self._data_loader.y_test[index]

    def create_pending_prediction(self, team: Team, surv_id: SurvivorID) -> None:
        """
        Create a pending prediction for a team-survivor combination.

        If one already exists, this method does nothing.
        """
        key: tuple[Team, SurvivorID] = (team, surv_id)

        # Only create if no pending prediction exists
        if key not in self._pending_predictions:
            random_index = random.randint(0, self._data_loader.num_testing_images - 1)
            pending_prediction: PendingPrediction = {
                "image_to_predict": self.get_image_from_index(random_index),
                "correct_label": self.get_label_from_index(random_index),
            }
            self._pending_predictions[key] = pending_prediction

    def read_pending_predictions(self, team: Team) -> list[tuple[SurvivorID, Any, Any]]:
        """
        Agents call this to get all pending predictions for their team. Gives them the data of the pending prediction, without the correct label.

        Returns list of tuples: (surv_id, image_to_predict, all_unique_labels)
        """
        pending_list = []
        for (
            team_key,
            surv_id,
        ), pending_prediction in self._pending_predictions.items():
            if team_key == team:
                pending_list.append(
                    (
                        surv_id,
                        pending_prediction["image_to_predict"],
                        self._data_loader.unique_labels,
                    )
                )
        return pending_list

    def predict(
        self, team: Team, surv_id: SurvivorID, prediction: PredictionLabel
    ) -> bool | None:
        """
        Process a prediction for a specific team-survivor combination.

        Returns:
            - bool: True if prediction was correct, False if incorrect
            - None: If no valid pending prediction exists (already predicted or never created)

        """
        key: tuple[Team, SurvivorID] = (team, surv_id)

        # Check if there's a valid pending prediction
        if key not in self._pending_predictions:
            LOGGER.warning(
                f"Agent attempted to predict surv_id {surv_id} for team {team}, but no valid pending prediction exists. Did another agent on your team predict this survivor before you?"
            )
            return None

        # Get the pending prediction and check if correct
        pending_prediction = self._pending_predictions[key]
        is_correct = pending_prediction["correct_label"] == prediction

        # Create completed prediction
        completed_prediction: CompletedPrediction = {
            "team": team,
            "surv_id": surv_id,
            "is_correct": is_correct,
        }

        # Move from pending to completed
        self._completed_predictions[key] = completed_prediction
        del self._pending_predictions[key]

        return is_correct
