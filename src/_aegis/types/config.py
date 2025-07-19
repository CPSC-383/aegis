from typing import Literal, TypedDict


class Config(TypedDict):
    ENABLE_PREDICTIONS: bool
    ENABLE_MOVE_COST: bool


FeatureFlagName = Literal["ENABLE_PREDICTIONS", "ENABLE_MOVE_COST"]
