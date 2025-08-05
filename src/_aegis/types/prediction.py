from typing import Any, NewType, TypedDict

from _aegis.team import Team

SurvivorID = NewType("SurvivorID", int)
PredictionLabel = NewType("PredictionLabel", int)


# Type for pending predictions
class PendingPrediction(TypedDict):
    image_to_predict: Any
    correct_label: PredictionLabel


# Type for completed predictions
class CompletedPrediction(TypedDict):
    team: Team
    surv_id: SurvivorID
    is_correct: bool
