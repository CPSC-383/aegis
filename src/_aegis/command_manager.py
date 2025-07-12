from _aegis.common.commands.agent_command import AgentCommand


class CommandManager:
    def __init__(self) -> None:
        self._command: AgentCommand | None = None
        self._ended_turn: bool = False

    def send(self, command: AgentCommand) -> None:
        if self._ended_turn:
            raise RuntimeError("Cannot send command after turn ended.")
        self._command = command

    def end_turn(self) -> None:
        if self._ended_turn:
            raise RuntimeError("Turn already ended.")
        self._ended_turn = True

    def get_commands(self) -> list[AgentCommand]:
        if not self._ended_turn:
            raise RuntimeError("Turn not ended. Call end_turn() first.")
        commands: list[AgentCommand] = []
        if self._command:
            commands.append(self._command)
        self._reset()
        return commands

    def _reset(self) -> None:
        self._command = None
        self._ended_turn = False
