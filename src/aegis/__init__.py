"""Public Aegis export stuff."""

from _aegis.cli import main
from _aegis.common import CellInfo, Direction, Location
from _aegis.common.commands.aegis_commands import ObserveResult, SendMessageResult
from _aegis.common.commands.aegis_commands.save_result import SaveResult
from _aegis.common.commands.agent_command import AgentCommand
from _aegis.common.commands.agent_commands import (
    Dig,
    Observe,
    Recharge,
    SendMessage,
)
from _aegis.common.objects import Rubble, Survivor
from _aegis.types.prediction import SurvivorID

__all__ = [
    "AgentCommand",
    "CellInfo",
    "Dig",
    "Direction",
    "Location",
    "Observe",
    "ObserveResult",
    "Recharge",
    "Rubble",
    "SaveResult",
    "SendMessage",
    "SendMessageResult",
    "Survivor",
    "SurvivorID",
    "main",
]

try:
    from _aegis.common.commands.agent_commands.predict import Predict
except ImportError:
    pass
else:
    __all__ += ["Predict"]

__version__ = "2.0.0"
