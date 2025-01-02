import CodeBlock from "@/components/CodeBlock";
import DocPage from "@/components/DocPage";
import { Ambulance } from "lucide-react";

function SaveSurvDocs() {
  return (
    <DocPage
      title="Save Surv"
      description="Represents a command for an agent to save a survivor."
      icon={Ambulance}
    >
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 dark:text-white">
          Overview
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          The{" "}
          <span className="text-light-primary dark:text-dark-primary">
            SAVE_SURV
          </span>{" "}
          command allows an agent to rescue a survivor from a cell. By issuing
          this command, the agent helps a survivor escape harm or be brought to
          safety. Some survivors may require the assistance of multiple agents
          to be successfully saved.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold border-b pb-2.5 mb-4 border-gray-200 dark:border-gray-800 dark:text-white">
          Example
        </h2>
        <CodeBlock language="python">
          {`# Sending the command
self._agent.send(SAVE_SURV())`}
        </CodeBlock>
      </section>
    </DocPage>
  );
}

export default SaveSurvDocs;
