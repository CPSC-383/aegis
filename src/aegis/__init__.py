from _aegis.main import main
from _aegis.common import Direction, Location, AgentID
from _aegis.common.commands.aegis_commands import (
    OBSERVE_RESULT,
)
from _aegis.common.commands.agent_command import AgentCommand
from _aegis.common.commands.agent_commands import (
    AGENT_UNKNOWN,
    MOVE,
    OBSERVE,
    RECHARGE,
    SAVE_SURV,
    SEND_MESSAGE,
    TEAM_DIG,
)
from _aegis.common.world.objects import Survivor
from _aegis.common.world.world import World
from _aegis.common.world.cell import Cell

# To generate the list after adding imports,
# use `uv run python -c` or `python -c` with the venv activated :
# python -c 'import aegis; names = sorted(n for n in dir(aegis) if not n.startswith("_")); print("__all__ = [\n    \"" + "\",\n    \"".join(names) + "\",\n]")'

__all__ = [
    "AGENT_UNKNOWN",
    "AgentCommand",
    "AgentID",
    "Direction",
    "Location",
    "MOVE",
    "OBSERVE",
    "OBSERVE_RESULT",
    "SAVE_SURV",
    "SEND_MESSAGE",
    "RECHARGE",
    "Survivor",
    "TEAM_DIG",
    "World",
    "Cell",
    "main",
]

try:
    from _aegis.common.commands.aegis_commands.SAVE_SURV_RESULT import SAVE_SURV_RESULT  # noqa: F401
    from _aegis.common.commands.agent_commands.PREDICT import PREDICT  # noqa: F401
except ImportError:
    pass
else:
    __all__.append("SAVE_SURV_RESULT")
    __all__.append("PREDICT")

__version__ = "2.0.0"
