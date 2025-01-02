import DocPage from "@/components/DocPage";
import MethodDoc from "@/components/MethodDoc";
import { Gamepad2 } from "lucide-react";

function AgentControllerDocs() {
  return (
    <DocPage
      title="Agent Controller"
      description="Interface for controlling an agent and interacting with the Aegis system."
      icon={Gamepad2}
    >
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 dark:text-white">
          Overview
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          The Agent Controller interface allows users to control and direct an
          agent’s actions. Through this interface, users can send commands to
          Aegis, influencing the agent's movements, interactions, and
          decision-making in the world. The controller enables agents to carry
          out specific tasks, such as rescuing survivors and navigating the
          environment.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold border-b pb-2.5 border-gray-200 dark:border-gray-800 dark:text-white">
          Methods
        </h2>
        <MethodDoc
          name="get_energy_level()"
          description="Returns the current energy level of the agent."
          returns={{
            type: "int",
            description: "The agent's current energy level.",
          }}
          example={`# Example usage
energy = self._agent.get_energy_level()
print(energy)
# Output: 326`}
        />
        <MethodDoc
          name="get_location()"
          description="Returns the current location of the agent."
          returns={{
            type: "Location",
            link: "/docs/common/location",
            description: "The agent's current location in the world.",
          }}
          example={`# Example usage
loc = self._agent.get_location()
print(loc)
# Output: (2, 5)`}
        />
        <MethodDoc
          name="get_round_number()"
          description="Returns the current round number of the simulation."
          returns={{
            type: "int",
            description: "The current round number of the simulation.",
          }}
          example={`# Example usage
round = self._agent.get_round_number()
print(round)
# Output: 27`}
        />
        <MethodDoc
          name="send()"
          description="Sends an action command to the Aegis system."
          parameters={[
            {
              name: "agent_action",
              type: "AgentCommand",
              description:
                "The action command that specifies what the agent should do.",
              required: true,
            },
          ]}
          example={`# Example usage
# Sending a command to save a survivor
self._agent.send(SAVE_SURV())`}
        />
        <MethodDoc
          name="log()"
          description="Logs a message, including the agent's ID and the current round number, for tracking or debugging purposes."
          parameters={[
            {
              name: "message",
              type: "str",
              description: "The message to log.",
              required: true,
            },
          ]}
          example={`# Example usage: Logging a message on round 4 for agent 1 in group 1
self._agent.log(f"My location is {self._agent.get_location()}")
# Output: [Agent#(1:1)]@4: My location is (17, 15)`}
        />
      </section>
    </DocPage>
  );
}

export default AgentControllerDocs;
