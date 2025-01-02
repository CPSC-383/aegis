import Admonition from "@/components/Admonition";
import DocPage from "@/components/DocPage";
import List from "@/components/List";
import { BookOpenText } from "lucide-react";

function System() {
  return (
    <DocPage
      title="Aegis System"
      description="This section will cover the basics of how Aegis works, and how to use the different parts of Aegis."
      icon={BookOpenText}
    >
      <section className="mb-8">
        <h2 className="text-2xl font-semibold dark:text-white">
          What is Aegis?
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          The Goobs have sent an elite space force to occupy Aegis, the galaxy's
          central hub dedicated to saving lives across the galaxy. This
          futuristic space station floats in a serene nebula, and it's the last
          beacon of hope in the vast and dangerous expanse of space. Equipped
          with powerful scanners and teleportation gates, Aegis connects distant
          worlds and provides a lifeline in the galaxy's most perilous regions.
          From here, they embark on their journeys, navigating the galaxy's
          dangers to rescue those in distress and tackle the most formidable
          dangers.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold border-b pb-2.5 border-gray-200 dark:border-gray-800 dark:text-white">
          Aegis Server
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Aegis handles changing the simulated world over time and executing
          commands from agents, then sending the results back to the agents.
          Aegis runs as an independent process on the user's machine. Before the
          simulation begins, agents connect to Aegis from their own processes.
          Communication between Aegis and the agents is handled via sockets.
        </p>
        <div>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Aegis operates in four main phases:
          </p>
          <List
            type="ordered"
            items={[
              {
                title: "Start Up",
                description: (
                  <p>
                    The simulated world is set up, and the protocol files for
                    the simulation are created.
                  </p>
                ),
              },
              {
                title: "Waiting for Connections",
                description: (
                  <p>Aegis waits for incoming connections from the agents.</p>
                ),
              },
              {
                title: "Running the Simulation",
                description: (
                  <p>
                    No new connections are accepted. The simulation progresses
                    step-by-step.
                  </p>
                ),
              },
              {
                title: "Shutdown",
                description: (
                  <p>
                    Aegis notifies all connected agents that the system is
                    shutting down and closes all protocol files.
                  </p>
                ),
              },
            ]}
          />
        </div>
        <div>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            To Run a simulation:
          </p>
          <List
            type="ordered"
            items={[
              {
                title: "Start Aegis",
              },
              {
                title: "Connect your agents to Aegis",
              },
            ]}
          />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold border-b pb-2.5 border-gray-200 dark:border-gray-800 dark:text-white">
          Basic Parts of Aegis
        </h2>
        <div>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Aegis consists of two separate processes, each handling different
            aspects of the simulation:
          </p>
          <List
            items={[
              {
                title: "The Controller",
                description: (
                  <p>
                    This is the main process of the simulator. It manages all
                    communication with agents, executes the simulation, and
                    maintains the current state of the world. It updates the
                    world as events happen.
                  </p>
                ),
              },
              {
                title: "The Client",
                description: (
                  <p>
                    When used, the Client provides a graphical interface via an
                    Electron-based GUI. It communicates with the Controller
                    through a WebSocket connection, allowing it to display
                    real-time updates of the world’s state during the
                    simulation. Additionally, it allows users to create their
                    own worlds.
                  </p>
                ),
              },
            ]}
          />
        </div>
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold border-b pb-2.5 border-gray-200 dark:border-gray-800 dark:text-white">
          Simulation
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          A simulation consists of multiple rounds, with each round being a
          single time step in the simulated world. During each round, each agent
          is given one second to decide what action to take. Aegis processes
          each agent one by one and waits for their command.
        </p>
        <div className="mt-4">
          <Admonition type="info" title="Important">
            The last command received at the end of the turn is the one that
            will be executed for that round.
          </Admonition>
        </div>
      </section>
    </DocPage>
  );
}
export default System;
