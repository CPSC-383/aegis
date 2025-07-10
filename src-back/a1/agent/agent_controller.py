from __future__ import annotations

from typing import Protocol, runtime_checkable

from _aegis import AgentCommand, Location


@runtime_checkable
class AgentController(Protocol):
    """
    Interface for controlling an agent and interacting with the AEGIS system.
    """

    def get_energy_level(self) -> int:
        """Returns the energy level of the agent."""
        ...

    def get_location(self) -> Location:
        """Returns the location of the agent."""
        ...

    def get_round_number(self) -> int:
        """Returns the current round number of the simulation."""
        ...

    def send(self, agent_action: AgentCommand) -> None:
        """
        Sends an action command to the AEGIS system.

        Args:
            agent_action: The action command to send.
        """
        ...

    def log(self, message: str) -> None:
        """
        Logs a message with the agent's ID and the round number.

        Args:
            message: The message to log.
        """
        ...
