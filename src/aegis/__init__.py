"""Public Aegis export stuff."""

from _aegis.cli import main
from _aegis.common import CellInfo, Direction, Location
from _aegis.common.commands.aegis_commands import ObserveResult, SendMessageResult
from _aegis.common.commands.aegis_commands.save_result import SaveResult
from _aegis.common.commands.agent_command import AgentCommand
from _aegis.common.commands.agent_commands import (
    Dig,
    Move,
    Observe,
    Recharge,
    Save,
    SendMessage,
)
from _aegis.common.objects import Rubble, Survivor

# To generate the list after adding imports,
# use `uv run scripts/sort.py`

__all__ = [  # noqa: RUF022
    "Dig",
    "Move",
    "Observe",
    "Recharge",
    "Save",
    "SaveResult",
    "AgentCommand",
    "CellInfo",
    "Direction",
    "Location",
    "ObserveResult",
    "Rubble",
    "SendMessage",
    "SendMessageResult",
    "Survivor",
    "main",
]

try:
    from _aegis.common.commands.agent_commands.predict import Predict
except ImportError:
    pass
else:
    __all__ += ["Predict"]

__version__ = "2.0.0"
