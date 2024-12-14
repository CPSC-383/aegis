import APIReference from "@/components/APIReference";
import CodeBlock from "@/components/CodeBlock";
import DocPage from "@/components/DocPage";
import { Signpost } from "lucide-react";

function MoveDocs() {
  return (
    <DocPage
      title="Move"
      description="Represents a command for an agent to move in a specified direction."
      icon={Signpost}
    >
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 dark:text-white">
          Overview
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          The{" "}
          <span className="text-light-primary dark:text-dark-primary">
            MOVE
          </span>{" "}
          command allows an agent to change its position by specifying a
          direction. This action is essential for navigating through the world.
          By sending this command, the agent updates its coordinates and updates
          information about the world.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold border-b pb-2.5 border-gray-200 dark:border-gray-800 dark:text-white">
          Params
        </h2>
        <APIReference
          name="direction"
          type="Direction"
          link="/docs/common/direction"
          description="The direction to move."
          required={true}
        />
      </section>

      <section>
        <h2 className="text-2xl font-semibold border-b pb-2.5 mb-4 border-gray-200 dark:border-gray-800 dark:text-white">
          Example
        </h2>
        <CodeBlock language="python">
          {`# Moving east 
self._agent.send(MOVE(Direction.EAST))`}
        </CodeBlock>
      </section>
    </DocPage>
  );
}

export default MoveDocs;
