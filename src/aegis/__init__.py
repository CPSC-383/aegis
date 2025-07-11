from _aegis.agent import BaseAgent, Brain
from _aegis.cli import main
from _aegis.common.commands.agent_command import AgentCommand
from _aegis.common.commands.agent_commands import (
    AGENT_UNKNOWN,
    END_TURN,
    MOVE,
    OBSERVE,
    # PREDICT,
    SAVE_SURV,
    SEND_MESSAGE,
    SLEEP,
    TEAM_DIG,
)
from _aegis.common import Direction, Location
from _aegis.common.world.world import World
from _aegis.common.world.objects import Survivor

# To generate the list after adding imports, use `uv run python -c` or `python -c` with the venv activated :
# python -c 'import aegis; names = sorted(n for n in dir(aegis) if not n.startswith("_")); print("__all__ = [\n    \"" + "\",\n    \"".join(names) + "\",\n]")'

__all__ = [
    "AGENT_UNKNOWN",
    "AgentCommand",
    "BaseAgent",
    "Brain",
    "Direction",
    "END_TURN",
    "Location",
    "MOVE",
    "OBSERVE",
    "SAVE_SURV",
    "SEND_MESSAGE",
    "SLEEP",
    "Survivor",
    "TEAM_DIG",
    "World",
    "main",
]
