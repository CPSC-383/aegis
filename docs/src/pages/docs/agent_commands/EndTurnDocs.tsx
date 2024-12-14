import CodeBlock from "@/components/CodeBlock";
import DocPage from "@/components/DocPage";
import { CircleStop } from "lucide-react";

function EndTurnDocs() {
  return (
    <DocPage
      title="End Turn"
      description="Represents a command that allows an agent to tell the server it is done with its turn."
      icon={CircleStop}
    >
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 dark:text-white">
          Overview
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          The{" "}
          <span className="text-light-primary dark:text-dark-primary">
            END_TURN
          </span>{" "}
          command signifies that an agent has finished its actions for the
          current round. By sending this command, the agent informs the server
          that it is no longer active in the current round, allowing simulation
          to progress to the next turn.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold border-b pb-2.5 mb-4 border-gray-200 dark:border-gray-800 dark:text-white">
          Example
        </h2>
        <CodeBlock language="python">
          {`# Sending the command
self._agent.send(END_TURN())`}
        </CodeBlock>
      </section>
    </DocPage>
  );
}

export default EndTurnDocs;
