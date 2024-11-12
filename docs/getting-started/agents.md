---
icon: octicons/people-16
---

This section will cover the basics needed to create agents that work with AEGIS. 

## Agents and the Simulated world in AEGIS

In the AEGIS simulation, agents are members of the elite space force. Here’s what you need to know:

1. **Communication**: Agent's can't talk to eachother directly. All communication and actions must go through AEGIS.
2. **World**: Each agent has to build their own world as they move around in the world. At the start, they only know
basic information of the world. The information includes fire, killing and charging cells and the chance that a cell has
a Survivor/Survivor Group.
3. **World Layout**: The world is a 2D grid of cells of squares. Each square has:
    - A stack of objects.
    - A move cost, which is the energy lost when moving onto that square.
4. **Field of View**: Agents can only see:
    - The current square they’re on, including life signals of objects in each layer (with deeper layers being more distorted).
    - The surrounding squares within a 1-square radius (e.g., north, northwest). They can see the basic details and the top object
    on each of these squares but not the life signals.
5. **Objects in the World**:
    - Rubble: Needs a certain amount of agents to remove and costs energy to clear. Each agent involved loses energy.
    - Survivor: A person who needs saving. If their energy is zero, they die.
    - Survivor Group: A group of one or more survivors.

## Agent Commands

Agents can use the following commands to interact with AEGIS. Click on each command for more information.

- **[END_TURN](../api/agent_commands/end-turn.md)**: Indicates the agent is done with its turn.
- **[MOVE](../api/agent_commands/move.md)**: Moves the agent in a specified direction.
- **[OBSERVE](../api/agent_commands/observe.md)**: Gathers information about a cell. Information becomes more distorted the further away the cell.
is from the agent. The distortion only affects the life signals list and the top layer of the cell.
- **[PREDICT](../api/agent_commands/predict.md)**: Represents the prediction of an agent.
- **[SAVE_SURV](../api/agent_commands/save-surv.md)**: Save a survivor.
- **[SEND_MESSAGE](../api/agent_commands/send-message.md)**: Sends a message to other agents. Note that messages are sent at the start of
the next round.
- **[SLEEP](../api/agent_commands/sleep.md)**: Recharges the agent.
- **[TEAM_DIG](../api/agent_commands/team-dig.md)**: Removes a piece of Rubble. If multiple agents are required, all agents must send the 
`TEAM_DIG` command in the same round.

## Agent States

Each round involves four main states for an agent: Click on each state for more information.
    
1. **IDLE**: The agent is waiting for instructions from AEGIS.
2. **READ_MAIL**: The agent has received the `MESSAGES_START` command and will start processing messages
from the other agents. The agent returns to the IDLE state when it receives the `MESSAGES_END` command.
3. **GET_CMD_RESULT**: The agent has received the `CMD_RESULT_START` command, indicating that AEGIS is sending the results
for the last command. The agent returns to the IDLE state when it receives the `CMD_RESULT_END` command.
4. **THINK**: The agent has received the `ROUND_START` command, allowing it to begin computing its actions for the
current round. The agent returns to the IDLE state when it receives the `ROUND_END` command.


## Simulation

A simulation consists of multiple rounds, with each round being a single time step in the simulated world. During each round
each agent is given one second to decide what action to take. AEGIS processes each agent one by one
and waits for their command. 

**The last command received from an agent is the one that will be executed for that round.**
