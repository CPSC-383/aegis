from _aegis.common.commands.agent_command import AgentCommand
from _aegis.common.commands.agent_commands import OBSERVE, SEND_MESSAGE
from _aegis.common.constants import Constants


try:
    from _aegis.common.commands.agent_commands.PREDICT import PREDICT
except ImportError:
    PREDICT = None  # pyright: ignore[reportConstantRedefinition]


class CommandManager:
    def __init__(self) -> None:
        self._action_command: AgentCommand | None = None
        self._message_queue: list[SEND_MESSAGE] = []
        self._directive_commands: list[AgentCommand] = []

    def get_action_command(self) -> AgentCommand | None:
        return self._action_command

    def get_directives(self) -> list[AgentCommand]:
        directives = list(self._directive_commands)
        self._directive_commands.clear()
        return directives

    def send(self, command: AgentCommand) -> None:
        if isinstance(command, SEND_MESSAGE):
            self._message_queue.append(command)
        elif isinstance(command, OBSERVE) or (
            PREDICT is not None and isinstance(command, PREDICT)
        ):
            if len(self._directive_commands) < Constants.MAX_DIRECTIVES:
                self._directive_commands.append(command)
        else:
            self._action_command = command

    def get_messages(self) -> list[SEND_MESSAGE]:
        messages = self._message_queue[:]
        self._message_queue.clear()
        return messages

    def reset_command(self) -> None:
        self._action_command = None

    def reset_directives(self) -> None:
        self._directive_commands.clear()

    def reset_messages(self) -> None:
        self._message_queue.clear()
