import APIReference from "@/components/APIReference";
import DocPage from "@/components/DocPage";
import OrderedList from "@/components/OrderedList";
import UnorderedList from "@/components/UnorderedList";
import { Users } from "lucide-react";

function Agents() {
  return (
    <DocPage
      title="Agents"
      description="This section will cover the basics needed to create agents that work with Aegis."
      icon={Users}
    >
      <section className="mb-8">
        <h2 className="text-2xl font-semibold dark:text-white">
          Agents and the Simulated world in Aegis
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          In the Aegis simulation, agents are members of the elite space force.
          Here’s what you need to know:
        </p>
        <OrderedList
          items={[
            {
              title: "Communication",
              description: (
                <p>
                  Agent's can't talk to eachother directly. All communication
                  and actions must go through Aegis.
                </p>
              ),
            },
            {
              title: "World",
              description: (
                <p>
                  Each agent has to build their own world as they move around.
                  At the start, they only know basic information of the world.
                  The information includes fire cells, killing celss, charging
                  cells and whether a cell has Survivors.
                </p>
              ),
            },
            {
              title: "World Layout",
              description: (
                <>
                  <p>
                    The world is a 2D grid of cells of squares. Each square has:
                  </p>
                  <UnorderedList
                    items={[
                      {
                        title: "Stack of objects",
                        description: (
                          <p>
                            This can include survivors waiting to be rescued or
                            rubble that needs to be cleared.
                          </p>
                        ),
                      },
                      {
                        title: "Move Cost",
                        description: (
                          <p>
                            Which is the energy lost when moving onto that
                            square.
                          </p>
                        ),
                      },
                      {
                        title: "Cell Type",
                        description: (
                          <p>
                            Each cell can have a specific type, such as
                            CHARGING_CELL for recharging energy, FIRE_CELL and
                            KILLER_CELL as a hazard, or NORMAL_CELL as a
                            standard walkable space.
                          </p>
                        ),
                      },
                    ]}
                  />
                </>
              ),
            },
            {
              title: "Field of View",
              description: (
                <>
                  <p>Agents can only see:</p>
                  <UnorderedList
                    items={[
                      {
                        title: "Current Square with Life Signals",
                        description: (
                          <p>
                            Represents the square the agent is currently on,
                            including the life signals of objects in each layer.
                            The deeper layers may be more distorted, making it
                            harder to detect objects or survivors deeper within
                            the stack.
                          </p>
                        ),
                      },
                      {
                        title: "Surrounding Squares within 1-Square Radius",
                        description: (
                          <p>
                            Represents the nearby squares around the agent,
                            within a 1-square radius (e.g., north, northwest,
                            etc.). The agent can observe basic details, along
                            with the top object in each square.
                          </p>
                        ),
                      },
                    ]}
                  />
                </>
              ),
            },
          ]}
        />
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold border-b pb-2.5 border-gray-200 dark:border-gray-800 dark:text-white">
          Agent Commands
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Agents can use the following commands to interact with Aegis. Click on
          each command for more information.
        </p>
        <APIReference
          name="END_TURN"
          nameLink="/docs/agent-commands/end-turn"
          description="Represents a command that allows an agent to tell the server it is done with its turn."
        />
        <APIReference
          name="MOVE"
          nameLink="/docs/agent-commands/move"
          description="Represents a command for an agent to move in a specified direction."
        />
        <APIReference
          name="SAVE_SURV"
          nameLink="/docs/agent-commands/save-surv"
          description="Represents a command for an agent to save a survivor."
        />
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold border-b pb-2.5 border-gray-200 dark:border-gray-800 dark:text-white">
          Agent States
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Each round involves four main states for an agent:
        </p>
        <OrderedList
          items={[
            {
              title: "IDLE",
              description: (
                <p>The agent is waiting for instructions from Aegis.</p>
              ),
            },
            {
              title: "READ_MAIL",
              description: (
                <p>
                  The agent has received the <code>MESSAGES_START</code> command
                  and will start processing messages from the other agents. The
                  agent returns to the <code>IDLE</code> state when it receives
                  the <code>MESSAGES_END</code> command.
                </p>
              ),
            },
            {
              title: "GET_CMD_RESULT",
              description: (
                <p>
                  The agent has received the <code>CMD_RESULT_START</code>{" "}
                  command, indicating that Aegis is sending the results for the
                  last command. The agent returns to the <code>IDLE</code> state
                  when it receives the <code>CMD_RESULT_END</code> command.
                </p>
              ),
            },
            {
              title: "THINK",
              description: (
                <p>
                  The agent has received the <code>ROUND_START</code> command,
                  allowing it to begin computing its actions for the current
                  round. The agent returns to the <code>IDLE</code> state when
                  it receives the <code>ROUND_END</code> command.
                </p>
              ),
            },
          ]}
        />
      </section>
    </DocPage>
  );
}

export default Agents;
