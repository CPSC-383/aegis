"""Public Aegis export stuff."""

from _aegis.cli import main
from _aegis.common import Direction, Location
from _aegis.common.commands.aegis_commands import ObserveResult, SendMessageResult
from _aegis.common.commands.agent_command import AgentCommand
from _aegis.common.commands.agent_commands import (
    Dig,
    Move,
    Observe,
    Recharge,
    Save,
    SendMessage,
)
from _aegis.common.cell import Cell
from _aegis.common.world.objects import Survivor

# To generate the list after adding imports,
# use `uv run scripts/sort.py`

__all__ = [  # noqa: RUF022
    "Dig",
    "Move",
    "Observe",
    "Recharge",
    "Save",
    "AgentCommand",
    "Cell",
    "Direction",
    "Location",
    "ObserveResult",
    "SendMessage",
    "SendMessageResult",
    "Survivor",
    "main",
]

try:
    from _aegis.common.commands.aegis_commands.save_result import (
        SaveResult,
    )
    from _aegis.common.commands.agent_commands.predict import Predict
except ImportError:
    pass
else:
    __all__ += ["Predict", "SaveResult"]

__version__ = "2.0.0"
