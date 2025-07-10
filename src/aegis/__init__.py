from _aegis.cli import main
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

# To generate the list, use `uv run python -c` or just `python -c` :
# python -c 'import aegis; names = sorted(n for n in dir(aegis) if not n.startswith("_")); print("__all__ = [\n    \"" + "\",\n    \"".join(names) + "\",\n]")'

__all__ = [
    "AGENT_UNKNOWN",
    "END_TURN",
    "MOVE",
    "OBSERVE",
    "SAVE_SURV",
    "SEND_MESSAGE",
    "SLEEP",
    "TEAM_DIG",
    "main",
]
