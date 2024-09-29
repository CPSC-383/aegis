This section will cover the basics of how AEGIS works, and how to use the different parts of AEGIS. 

## What is AEGIS?

The Goobs have sent an elite space force to occupy AEGIS, the galaxy's central hub dedicated to saving lives across the galaxy. This
futuristic space station floats in a serene nebula, and it's the last beacon of hope in the vast and dangerous expanse of space. 
Equipped with powerful scanners and teleportation gates, AEGIS connects distant worlds and provides a lifeline in the galaxy's most 
perilous regions. From here, they embark on their journeys, navigating the galaxy's dangers to rescue those in distress and tackle
the most formidable dangers.

## The AEGIS server

AEGIS handles changing the simulated world over time and executing commands from
agents, then sending the results back to the agents. AEGIS runs as an independent
process on the user's machine. Before the simulation begins, agents connect to AEGIS
from their own processes. Communication between AEGIS and the agents is handled via
sockets.

AEGIS operates in four main phases:

1. **Start up**: The simulated world is set up, and the protocol files for the simulation are created.
2. **Waiting for Connections**: AEGIS waits for incoming connections from the agents.
3. **Running the Simulation**: No new connections are accepted. The simulation progresses step-by-step.
4. **Shutdown**: AEGIS notifies all connected agents that the system is shutting down and closes all protocol files.

To Run a simulation:

1. Start AEGIS.
2. Connect your agents to AEGIS.

After the simulation ends and AEGIS shuts down, you must restart AEGIS and reconnect your 
agents to run another simulation.

_Fortunately, the client and scripts handle this process automatically for you. 
You'll learn more about this later!_

## The basic parts of AEGIS

AEGIS consists of two separate processes, each handling different aspects of the simulation:

1. **The Controller**: This is the main process of the simulator. It manages all communication with agents, 
executes the simulation, and maintains the current state of the world. It updates the world as 
events happen.
2. **The Client**: When used, the Client provides a graphical interface via an Electron-based GUI.
It communicates with the Controller through a WebSocket connection, allowing it to display real-time updates of
the world’s state during the simulation. Additionally, it allows users to create their own worlds.

## AEGIS Commands

AEGIS uses the following commands to interact with the agents. Click on each command for more information.

- **[AEGIS UNKNOWN](../api/aegis_commands/aegis-unknown.md)**: Represents an unknown command from the agent.
- **[CONNECT_OK](../api/aegis_commands/connect-ok.md)**: Result of the agent successfully connecting to AEGIS.
- **[DEATH_CARD](../api/aegis_commands/death-card.md)**: If the agent has died.
- **[DISCONNECT](../api/aegis_commands/disconnect.md)**: AEGIS is shutting down, allowing the agent to shutdown as well.
- **[FWD_MESSAGE](../api/aegis_commands/fwd-message.md)**: A message received from one agent that is to be forwarded to another agent.
- **[MOVE_RESULT](../api/aegis_commands/move-result.md)**: Result of the agent moving in a certain direction.
- **[OBSERVE_RESULT](../api/aegis_commands/observe-result.md)**: Result of observing a grid.
- **[SAVE_SURV_RESULT](../api/aegis_commands/save-surv-result.md)**: Result of saving a survivor.
- **[SLEEP_RESULT](../api/aegis_commands/sleep-result.md)**: Result of the agent sleeping.
- **[TEAM_DIG_RESULT](../api/aegis_commands/team-dig-result.md)**: Result of digging rubble.

Now to learn about [Agents](agents.md)!
