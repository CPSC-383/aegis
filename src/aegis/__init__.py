from _aegis.agent import Agent
from _aegis.cli import main
from _aegis.common import Direction, Location
from _aegis.common.commands.aegis_commands import OBSERVE_RESULT, PREDICT_RESULT
from _aegis.common.commands.agent_command import AgentCommand
from _aegis.common.commands.agent_commands import (
    AGENT_UNKNOWN,
    MOVE,
    OBSERVE,
    PREDICT,
    RECHARGE,
    SAVE_SURV,
    SEND_MESSAGE,
    TEAM_DIG,
)
from _aegis.common.world.objects import Survivor
from _aegis.common.world.world import World

# To generate the list after adding imports,
# use `uv run python -c` or `python -c` with the venv activated :
# python -c 'import aegis; names = sorted(n for n in dir(aegis) if not n.startswith("_")); print("__all__ = [\n    \"" + "\",\n    \"".join(names) + "\",\n]")'

__all__ = [
    "AGENT_UNKNOWN",
    "AgentCommand",
    "Direction",
    "Location",
    "MOVE",
    "OBSERVE",
    "OBSERVE_RESULT",
    "PREDICT",
    "PREDICT_RESULT",
    "SAVE_SURV",
    "SEND_MESSAGE",
    "RECHARGE",
    "Survivor",
    "TEAM_DIG",
    "World",
    "main",
    "Agent",
]

__version__ = "2.0.0"
