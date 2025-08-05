from .common.commands.agent_command import AgentCommand
from .common.commands.agent_commands import Observe, Predict, SendMessage
from .constants import Constants


class CommandManager:
    def __init__(self) -> None:
        self._action_command: AgentCommand | None = None
        self._message_queue: list[SendMessage] = []
        self._directive_commands: list[AgentCommand] = []

    def get_action_command(self) -> AgentCommand | None:
        return self._action_command

    def get_directives(self) -> list[AgentCommand]:
        return self._directive_commands[:]

    def send(self, command: AgentCommand) -> None:
        if isinstance(command, SendMessage):
            self._message_queue.append(command)
        elif isinstance(command, (Observe, Predict)):
            if len(self._directive_commands) < Constants.MAX_DIRECTIVES:
                self._directive_commands.append(command)
        else:
            self._action_command = command

    def get_messages(self) -> list[SendMessage]:
        return self._message_queue[:]

    def clear(self) -> None:
        self._action_command = None
        self._directive_commands.clear()
        self._message_queue.clear()
