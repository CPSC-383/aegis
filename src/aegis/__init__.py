"""
The entirety of the public API is exposed here.

The following sections will help you discover the API.

## Common

Contains core data structures and types used across AEGIS.

- [`aegis.AgentID`][]: Represents an agent with a unique ID and group ID.
- [`aegis.AgentIDList`][]: Represents a list of AgentID instances.
- [`aegis.Direction`][]: Enum representing different directions.
- [`aegis.LifeSignals`][]: Represents a collection of life signals.
- [`aegis.Location`][]: Represents a location in the world.

## World

Defines the world and its cell-based structure for simulation.

- [`aegis.World`][]: Represents a 2D grid of cells.
- [`aegis.Cell`][]: Represents a cell in the world.

### World Objects

The various possible layers in a cell.

- [`aegis.WorldObject`][]: Represents a object in the world.
- [`aegis.Survivor`][]: Represents a survivor layer in a cell.
- [`aegis.Rubble`][]: Represents a rubble layer in a cell.

### World Objects Info

Contains information about world objects.

- [`aegis.CellInfo`][]: Represents the information of a cell in the world.
- [`aegis.SurroundInfo`][]: Represents the information about the surrounding cells of the agent.

## Commands

### Agent Commands

Commands available for the agents interacting with AEGIS.

- [`aegis.AgentCommand`][]: The base class that represents all commands coming from agents.
- [`aegis.AGENT_UNKNOWN`][]: Represents an unknown agent command.
- [`aegis.END_TURN`][]: Represents a command that allows an agent to tell the server it is done with its turn.
- [`aegis.MOVE`][]: Represents a command for an agent to move in a specified direction.
- [`aegis.OBSERVE`][]: Represents a command for an agent to observe a cell in the world.
- [`aegis.PREDICT`][]: Represents the prediction of an agent.
- [`aegis.SAVE_SURV`][]: Represents a command for an agent to save a survivor.
- [`aegis.SEND_MESSAGE`][]: Represents a command for an agent to send a message to other agents.
- [`aegis.SLEEP`][]: Represents a command for an agent to sleep and recharge energy.
- [`aegis.TEAM_DIG`][]: Represents a command for an agent to dig rubble.

### Aegis Commands

Commands AEGIS uses to interact with the agents.

- [`aegis.AegisCommand`][]: The base class that represents all commands coming from aegis.
- [`aegis.AEGIS_UNKNOWN`][]: Represents an unknown command in AEGIS.
- [`aegis.CONNECT_OK`][]: Represents the result of the agent successfully connecting to AEGIS.
- [`aegis.DEATH_CARD`][]: Represents if the agent has died.
- [`aegis.DISCONNECT`][]: Represents if the agent has disconnected and the system has shutdown.
- [`aegis.SEND_MESSAGE_RESULT`][]: Represents a message that came from another agent.
- [`aegis.MOVE_RESULT`][]: Represents the result of the agent moving.
- [`aegis.OBSERVE_RESULT`][]: Represents the result of observing a cell.
- [`aegis.PREDICT_RESULT`][]: Represents the result of an agent's prediction.
- [`aegis.SAVE_SURV_RESULT`][]: Represents the result of saving a survivor.
- [`aegis.SLEEP_RESULT`][]: Represents the result of the agent sleeping.
- [`aegis.TEAM_DIG_RESULT`][]: Represents the result of digging rubble.
"""

from aegis.common import AgentID, AgentIDList, Direction, LifeSignals, Location
from aegis.common.commands.aegis_command import AegisCommand
from aegis.common.commands.aegis_commands import (
    AEGIS_UNKNOWN,
    CONNECT_OK,
    DEATH_CARD,
    DISCONNECT,
    MOVE_RESULT,
    OBSERVE_RESULT,
    PREDICT_RESULT,
    SAVE_SURV_RESULT,
    SEND_MESSAGE_RESULT,
    SLEEP_RESULT,
    TEAM_DIG_RESULT,
)
from aegis.common.commands.agent_command import AgentCommand
from aegis.common.commands.agent_commands import (
    AGENT_UNKNOWN,
    END_TURN,
    MOVE,
    OBSERVE,
    PREDICT,
    SAVE_SURV,
    SEND_MESSAGE,
    SLEEP,
    TEAM_DIG,
)
from aegis.common.world.cell import Cell
from aegis.common.world.info import (
    CellInfo,
    SurroundInfo,
)
from aegis.common.world.objects import (
    Rubble,
    Survivor,
    WorldObject,
)
from aegis.common.world.world import World

__all__ = [
    "AGENT_UNKNOWN",
    "AEGIS_UNKNOWN",
    "AegisCommand",
    "AgentCommand",
    "AgentID",
    "AgentIDList",
    "CONNECT_OK",
    "DEATH_CARD",
    "DISCONNECT",
    "Direction",
    "END_TURN",
    "SEND_MESSAGE_RESULT",
    "Cell",
    "CellInfo",
    "LifeSignals",
    "Location",
    "MOVE",
    "MOVE_RESULT",
    "OBSERVE",
    "OBSERVE_RESULT",
    "PREDICT",
    "PREDICT_RESULT",
    "Rubble",
    "SAVE_SURV",
    "SAVE_SURV_RESULT",
    "SEND_MESSAGE",
    "SLEEP",
    "SLEEP_RESULT",
    "SurroundInfo",
    "Survivor",
    "TEAM_DIG",
    "TEAM_DIG_RESULT",
    "World",
    "WorldObject",
]
