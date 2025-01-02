import DocPage from "@/components/DocPage";
import APIReference from "@/components/APIReference";

function APIIntro() {
  return (
    <DocPage
      title="Aegis API Documentation"
      description="Explore the Aegis API, which provides structures, commands, and functionality for interacting with the world."
    >
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 dark:text-white">
          Introduction
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          The entirety of the public API is exposed here. The following sections
          will help you discover the API's capabilities and components.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold border-b pb-2.5 border-gray-200 dark:border-gray-800 dark:text-white">
          Common
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Contains core data structures and types used across Aegis.
        </p>
        <APIReference
          name="Direction"
          nameLink="/docs/common/direction"
          type="Enum"
          description="Enum representing different cardinal directions."
        />
        <APIReference
          name="Location"
          nameLink="/docs/common/location"
          type="Class"
          description="Represents a location in the world."
        />
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold border-b pb-2.5 border-gray-200 dark:border-gray-800 dark:text-white">
          World
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Defines the world and its cell-based structure for simulation.
        </p>
        <APIReference
          name="World"
          nameLink="/docs/world/world"
          type="Class"
          description="Represents a 2D grid of cells."
        />
        <APIReference
          name="Cell"
          nameLink="/docs/world/cell"
          type="Class"
          description="Represents a cell in the world."
        />
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold border-b pb-2.5 border-gray-200 dark:border-gray-800 dark:text-white">
          Commands
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Commands available for agents interacting with Aegis.
        </p>
        <APIReference
          name="END_TURN"
          nameLink="/docs/agent-commands/end-turn"
          type="AgentCommand"
          description="Represents a command that allows an agent to tell the server it is done with its turn."
        />
        <APIReference
          name="MOVE"
          nameLink="/docs/agent-commands/move"
          type="AgentCommand"
          description="Represents a command for an agent to move in a specified direction."
        />
        <APIReference
          name="SAVE_SURV"
          nameLink="/docs/agent-commands/save-surv"
          type="AgentCommand"
          description="Represents a command for an agent to save a survivor."
        />
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold border-b pb-2.5 border-gray-200 dark:border-gray-800 dark:text-white">
          Agent
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Contains the core components for agents.
        </p>
        <APIReference
          name="AgentController"
          nameLink="/docs/agent/agent-controller"
          type="Class"
          description="An interface for controlling an agent and interacting with the Aegis system."
        />
      </section>
    </DocPage>
  );
}

export default APIIntro;
