from typing import NewType, TypedDict

from _aegis.team import Team

SurvivorID = NewType("SurvivorID", int)
PredictionLabel = NewType("PredictionLabel", int)


# Type for prediction data associated with a team-survivor pair
class PredictionData(TypedDict):
    agent_group: list[int]
    image_index: int


# Type for prediction results
class PredictionResult(TypedDict):
    agent_id: int
    prediction_correct: bool
