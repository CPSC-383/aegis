# pyright: reportImportCycles = false

from typing import TYPE_CHECKING

from .aegis_config import is_feature_enabled
from .agent import Agent
from .agent_predictions.prediction_handler import PredictionHandler
from .common import CellInfo, Direction
from .common.commands.aegis_command import AegisCommand
from .common.commands.aegis_commands import (
    ObserveResult,
)
from .common.commands.agent_command import AgentCommand
from .common.commands.agent_commands import (
    Observe,
    Predict,
)
from .common.location import Location
from .constants import Constants
from .logger import LOGGER
from .types.prediction import SurvivorID

if TYPE_CHECKING:
    from .game import Game


class CommandProcessor:
    def __init__(
        self,
        game: "Game",
        agents: dict[int, Agent],
        prediction_handler: PredictionHandler | None,
    ) -> None:
        self._agents: dict[int, Agent] = agents
        self._game: Game = game
        self._prediction_handler: PredictionHandler | None = prediction_handler

    def _process(self, commands: list[AgentCommand]) -> None:
        for cmd in commands:
            agent_id = cmd.get_id()
            agent = self._game.get_agent(agent_id)

            match cmd:
                case Observe():
                    agent = self._game.get_agent(cmd.get_id())
                    agent.add_energy(-Constants.OBSERVE_ENERGY_COST)
                case Predict():
                    if is_feature_enabled("ENABLE_PREDICTIONS"):
                        self._handle_predict(cmd)
                    else:
                        LOGGER.warning(
                            "Predict command received but predictions are disabled!!"
                        )
                case _:
                    LOGGER.warning("Aegis received an unknown command: %s", cmd)

    def _handle_predict(self, cmd: Predict) -> None:
        agent = self._game.get_agent(cmd.get_id())
        if self._prediction_handler is not None:
            prediction_result = self._prediction_handler.predict(
                agent.team, SurvivorID(cmd.surv_id), cmd.label
            )

            if prediction_result is None:
                # No valid pending prediction exists (already predicted or never created)
                LOGGER.warning(
                    f"Agent {agent.id} attempted invalid prediction for surv_id {cmd.surv_id}"
                )
            elif prediction_result:
                self._game.team_info.add_score(agent.team, Constants.PRED_CORRECT_SCORE)
                self._game.team_info.add_predicted(agent.team, 1, correct=True)
            else:
                self._game.team_info.add_predicted(agent.team, 1, correct=False)

    def _handle_command(
        self,
        cmd: AgentCommand,
        _agent: Agent,
        energy: int,
        _location: Location,
        _surround: dict[Direction, CellInfo],
    ) -> list[AegisCommand]:
        match cmd:
            case Observe():
                cell_info, layers = CellInfo(), []
                cell = self._game.get_cell_at(cmd.location)
                if cell:
                    cell_info = cell.get_cell_info()
                    layers = cell.get_layers()
                return [ObserveResult(energy, cell_info, layers)]

            case _:
                return []
