import Admonition from "@/components/Admonition";
import CodeBlock from "@/components/CodeBlock";
import DocPage from "@/components/DocPage";
import FileTree from "@/components/FileTree";
import OrderedList from "@/components/OrderedList";
import SystemSwitcher from "@/components/SystemSwitcher";
import { Download } from "lucide-react";
import { Link } from "react-router";

function Installation() {
  return (
    <DocPage
      title="Installation"
      description="A step-by-step guide to install Aegis on your system."
      icon={Download}
    >
      <Admonition type="info" title="Before You Begin">
        Ensure that your system meets the following prerequisites:
        <ul className="pt-4">
          <li>
            <strong>- Python 3.12.x</strong>
            <div className="pl-4">
              <p>
                To check if you have the correct Python version installed, run
                the following command in your terminal:
              </p>
              <SystemSwitcher
                children={{
                  macLinux: (
                    <>
                      <CodeBlock language="bash">{`python3 --version`}</CodeBlock>
                    </>
                  ),
                  windows: (
                    <>
                      <CodeBlock language="bash">{`python --version`}</CodeBlock>
                    </>
                  ),
                }}
              />
              <p>
                This should return <strong>Python 3.12.x</strong>.
              </p>
            </div>
          </li>
        </ul>
      </Admonition>

      <section className="mb-8 mt-8">
        <h2 className="text-2xl font-semibold border-b pb-2.5 border-gray-200 dark:border-gray-800 dark:text-white">
          Installation
        </h2>

        <OrderedList
          items={[
            {
              title: "Download the project",
              description: (
                <p>
                  Download the ZIP file and unzip it with your preferred method.
                  <br />
                  If successful, a new directory called <code>aegis</code>{" "}
                  should have been created.
                </p>
              ),
            },
            {
              title: "Navigate to the project directory",
              description: <CodeBlock language="bash">{`cd aegis`}</CodeBlock>,
            },
            {
              title: "Setting up the project",
              description: (
                <div>
                  <p>
                    Aegis requires a set of Python packages to function.
                    Installing these in a virtual environment ensures there are
                    no conflicts with other Python projects or system-wide
                    packages.
                  </p>
                  <div className="mt-4">
                    <p>Run the setup script:</p>
                    <SystemSwitcher
                      children={{
                        macLinux: (
                          <CodeBlock language="bash">
                            {`python3 setup.py 
source .venv/bin/activate
`}
                          </CodeBlock>
                        ),
                        windows: (
                          <CodeBlock language="bash">
                            {`python setup.py 
.venv\\Scripts\\activate
`}
                          </CodeBlock>
                        ),
                      }}
                    />
                    <p>
                      If the script was successful, a virtual environment named{" "}
                      <code>.venv</code> should have been created, the required
                      packages installed within it and the client for your
                      platform should be in the <code>client</code> folder.
                    </p>
                  </div>
                  <div className="mt-4">
                    <p>Steps do to it manually if the setup script failed:</p>
                    <SystemSwitcher
                      children={{
                        macLinux: (
                          <CodeBlock language="bash">
                            {`python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements
`}
                          </CodeBlock>
                        ),
                        windows: (
                          <CodeBlock language="bash">
                            {`python -m venv .venv
.venv\\Scripts\\activate
pip install -r requirements
`}
                          </CodeBlock>
                        ),
                      }}
                    />
                    <p>
                      Unzip your platform client in the client folder with your
                      preferred method.
                    </p>
                  </div>
                </div>
              ),
            },
            {
              title: "Confirm Installation",
              description: (
                <p>
                  To confirm that Aegis installed properly, follow the steps
                  outlined{" "}
                  <Link
                    to="/getting-started/running-aegis"
                    className="text-light-primary dark:text-dark-primary"
                  >
                    here
                  </Link>
                  .
                </p>
              ),
            },
          ]}
        />
        <Admonition type="tip" title="Virtual Environment">
          <div className="space-y-4">
            <p>
              <strong>
                Deactivate the virtual environment once you're done working on
                the assignment:
              </strong>
            </p>
            <CodeBlock language="bash">{`deactivate`}</CodeBlock>
            <p>
              You must reactivate the virtual environment every time you work on
              the project. If you're not inside the environment, you may
              encounter missing dependency errors.
            </p>
          </div>
        </Admonition>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold border-b pb-2.5 border-gray-200 dark:border-gray-800 dark:text-white">
          File Structure
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          The Aegis client uses a specific structure for agents and worlds. Be
          sure to follow these guidelines so the client can find and run the
          necessary files correctly.
        </p>
        <h3 className="mt-4 text-xl font-semibold mb-4 dark:text-white">
          Agent Structure
        </h3>

        <FileTree
          data={[
            {
              name: "src",
              type: "folder",
              children: [
                {
                  name: "agents",
                  type: "folder",
                  children: [
                    {
                      name: "example_agent",
                      type: "folder",
                      children: [
                        { name: "example_agent.py", type: "file" },
                        { name: "main.py", type: "file" },
                      ],
                    },
                  ],
                },
              ],
            },
          ]}
        />
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Place new agents in the <code>src/agents</code> directory.
          <br />
          Agents must include a <code>main.py</code> file.
        </p>

        <h3 className="mt-4 text-xl font-semibold mb-4 dark:text-white">
          World Structure
        </h3>

        <FileTree
          data={[
            {
              name: ".",
              type: "folder",
              children: [
                {
                  name: "worlds",
                  type: "folder",
                  children: [
                    {
                      name: "ExampleWorld.world",
                      type: "file",
                    },
                  ],
                },
              ],
            },
          ]}
        />
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Place new worlds in the <code>worlds</code> directory.
          <br />
          All world files must end with <code>.world</code>.
        </p>
      </section>
    </DocPage>
  );
}

export default Installation;
