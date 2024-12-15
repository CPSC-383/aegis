import CodeBlock from "@/components/CodeBlock";
import DocPage from "@/components/DocPage";
import { CirclePlay } from "lucide-react";
import MacError from "/mac_error.png";
import { Link } from "react-router-dom";
import List from "@/components/List";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function RunningAegis() {
  return (
    <DocPage
      title="Running Aegis"
      description="This section will cover how to run Aegis."
      icon={CirclePlay}
    >
      <section className="mb-8">
        <h2 className="text-2xl font-semibold dark:text-white">
          How to run Aegis
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          There are two ways to run Aegis: using the provided script or via the
          client.
        </p>
      </section>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold border-b pb-2.5 border-gray-200 dark:border-gray-800 dark:text-white">
          Using the provided script
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          To run Aegis in the command line, use the{" "}
          <code>run_headless_aegis_with_agents.py</code> script. The usage of
          the python script is shown below:
        </p>
        <CodeBlock language="bash">{`python run_headless_aegis_with_agents.py \\
  --agent-amount <agent amount> \\
  --rounds <num of rounds> \\
  --agent <agent directory> \\
  --world <world file>`}</CodeBlock>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          For Assignment 1, the <code>--agent-amount</code> argument is optional
          as it defaults to 1. You can omit this argument when running the
          command. Below is an example of how to execute the simulation using
          the <code>example_agent</code> and <code>ExampleWorld</code>,
          configured to run for 50 rounds:
        </p>
        <CodeBlock language="bash">{`python run_headless_aegis_with_agents.py \\
  --rounds 50 \\
  --agent example_agent \\
  --world ExampleWorld`}</CodeBlock>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          If you need a quick reminder on how to use the script, simply include
          the <code>-h</code> flag to display the help menu.
        </p>
        <CodeBlock language="bash">{`python run_headless_aegis_with_agents.py -h`}</CodeBlock>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold border-b pb-2.5 border-gray-200 dark:border-gray-800 dark:text-white">
          Using the client
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          You can either open the client from the command line or a file
          explorer. Run the following in the <code>aegis</code> folder if you
          use the command line:
        </p>
        <CodeBlock language="bash">{`cd client`}</CodeBlock>

        <Tabs defaultValue="mac" className="w-[400px] mt-4">
          <TabsList className="bg-light-main-background dark:bg-dark-main-background border border-gray-200 dark:border-gray-800 shadow-sm">
            <TabsTrigger value="mac">Mac</TabsTrigger>
            <TabsTrigger value="windows">Windows</TabsTrigger>
            <TabsTrigger value="linux">Linux</TabsTrigger>
          </TabsList>
          <TabsContent value="mac">
            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm rounded-lg">
              <CardHeader className="pb-2">
                <CardTitle>Run Aegis on macOS</CardTitle>
                <CardDescription>
                  Follow these steps to launch the Aegis client on macOS command
                  line and resolve potential errors.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <CodeBlock language="bash">{`open Aegis.app`}</CodeBlock>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  If you get the following error, click{" "}
                  <Link
                    to="/common-errors"
                    className="text-light-primary dark:text-dark-primary"
                  >
                    here
                  </Link>{" "}
                  for a step-by-step solution.
                </p>
                <img src={MacError} className="w-64" />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="windows">
            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm rounded-lg">
              <CardHeader className="pb-2">
                <CardTitle>Run Aegis on windows</CardTitle>
                <CardDescription>
                  Follow these steps to launch the Aegis client on windows
                  command line.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <CodeBlock language="bash">{`.\\aegis-client.exe`}</CodeBlock>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="linux">
            <Card className="border border-gray-200 dark:border-gray-800 shadow-sm rounded-lg">
              <CardHeader className="pb-2">
                <CardTitle>Run Aegis on linux</CardTitle>
                <CardDescription>
                  Follow these steps to launch the Aegis client on linux command
                  line.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <CodeBlock language="bash">{`./aegis-client.AppImage`}</CodeBlock>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Once the client opens, follow the steps below to run a game.
        </p>
        <List
          type="ordered"
          items={[
            {
              title: "Setting Up Aegis",
              description: (
                <p>
                  Since the client can't automatically find the Aegis code,
                  you'll need to set it up manually. Click on the{" "}
                  <em>Setup Aegis Path</em> button, and select the{" "}
                  <code>aegis</code> root directory. If set up properly, the
                  sidebar tabs will appear and the client should display a list
                  of available worlds when you attempt to select one.
                </p>
              ),
            },
            {
              title: "Starting Up Aegis",
              description: (
                <p>
                  In the <strong>Aegis</strong> tab, select a world, and
                  configure the number of rounds. Once the{" "}
                  <em>Start Up Game</em> button becomes active, click it. You’ll
                  know Aegis has started successfully when either the console
                  confirms it or the button changes to <em>Kill Game</em>. At
                  this point, you can proceed to connect your agents.
                </p>
              ),
            },
            {
              title: "Connecting Agents",
              description: (
                <p>
                  Go to the <strong>Agents</strong> tab, choose the agent you
                  wish to use, and assign it a group name. When the{" "}
                  <em>Connect Agent</em> button becomes active, click it to
                  connect your agents.
                </p>
              ),
            },
            {
              title: "Simulation",
              description: (
                <p>
                  If everything has been set up correctly, you should see the
                  simulation appear.
                </p>
              ),
            },
          ]}
        />
      </section>
    </DocPage>
  );
}

export default RunningAegis;
