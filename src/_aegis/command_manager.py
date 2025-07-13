from _aegis.common.commands.agent_command import AgentCommand
from _aegis.common.commands.agent_commands import SEND_MESSAGE


class CommandManager:
    def __init__(self) -> None:
        self._command: AgentCommand | None = None
        self._message_queue: list[SEND_MESSAGE] = []

    def get_command(self) -> AgentCommand | None:
        return self._command

    def send(self, command: AgentCommand) -> None:
        if isinstance(command, SEND_MESSAGE):
            self._message_queue.append(command)
        else:
            self._command = command

    def get_messages(self) -> list[SEND_MESSAGE]:
        messages = self._message_queue[:]
        self._message_queue.clear()
        return messages

    def reset_command(self) -> None:
        self._command = None

    def reset_messages(self) -> None:
        self._message_queue.clear()
