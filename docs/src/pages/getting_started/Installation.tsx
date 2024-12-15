import Admonition from "@/components/Admonition";
import CodeBlock from "@/components/CodeBlock";
import DocPage from "@/components/DocPage";
import List from "@/components/List";
import { Download } from "lucide-react";
import { Link } from "react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileTree, FileTreeItem } from "@/components/ui/file-tree";

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
              <Tabs defaultValue="maclinux" className="w-[400px] mt-4">
                <TabsList className="bg-light-main-background dark:bg-dark-main-background border border-gray-200 dark:border-gray-800 shadow-sm">
                  <TabsTrigger value="maclinux">Mac/Linux</TabsTrigger>
                  <TabsTrigger value="windows">Windows</TabsTrigger>
                </TabsList>
                <TabsContent value="maclinux">
                  <Card className="border border-gray-200 dark:border-gray-800 shadow-sm rounded-lg">
                    <CardHeader className="pb-2">
                      <CardTitle>Verify Python Installation</CardTitle>
                      <CardDescription>
                        Use this command to check the installed Python version
                        and ensure it's properly set up.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <CodeBlock language="bash">
                        {`python3 --version`}
                      </CodeBlock>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="windows">
                  <Card className="border border-gray-200 dark:border-gray-800 shadow-sm rounded-lg">
                    <CardHeader className="pb-2">
                      <CardTitle>Verify Python Installation</CardTitle>
                      <CardDescription>
                        Use this command to check the installed Python version
                        and ensure it's properly set up.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <CodeBlock language="bash">
                        {`python --version`}
                      </CodeBlock>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
              <p className="mt-2">
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

        <List
          type="ordered"
          items={[
            {
              title: "Download the assignment",
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
              title: "Navigate to the assignment directory",
              description: <CodeBlock language="bash">{`cd aegis`}</CodeBlock>,
            },
            {
              title: "Setting up the assignment",
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
                    <Tabs defaultValue="maclinux" className="w-[400px] mt-4">
                      <TabsList className="bg-light-main-background dark:bg-dark-main-background border border-gray-200 dark:border-gray-800 shadow-sm">
                        <TabsTrigger value="maclinux">Mac/Linux</TabsTrigger>
                        <TabsTrigger value="windows">Windows</TabsTrigger>
                      </TabsList>
                      <TabsContent value="maclinux">
                        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm rounded-lg">
                          <CardHeader className="pb-2">
                            <CardTitle>
                              Setup and Activate Virtual Environment
                            </CardTitle>
                            <CardDescription>
                              Use these commands to set up and activate the
                              virtual environment for your assignment.
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pt-2">
                            <CodeBlock language="bash">
                              {`python3 setup.py 
source .venv/bin/activate`}
                            </CodeBlock>
                          </CardContent>
                        </Card>
                      </TabsContent>
                      <TabsContent value="windows">
                        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm rounded-lg">
                          <CardHeader className="pb-2">
                            <CardTitle>
                              Setup and Activate Virtual Environment
                            </CardTitle>
                            <CardDescription>
                              Use these commands to set up and activate the
                              virtual environment for your assignment.
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pt-2">
                            <CodeBlock language="bash">
                              {`python setup.py 
.venv\\Scripts\\activate`}
                            </CodeBlock>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
                    <p className="mt-2">
                      If the script was successful, a virtual environment named{" "}
                      <code>.venv</code> should have been created, the required
                      packages installed within it and the client for your
                      platform should be in the <code>client</code> folder.
                    </p>
                  </div>
                  <div className="mt-4">
                    <p>Steps do to it manually if the setup script failed:</p>
                    <Tabs defaultValue="maclinux" className="w-[400px] mt-4">
                      <TabsList className="bg-light-main-background dark:bg-dark-main-background border border-gray-200 dark:border-gray-800 shadow-sm">
                        <TabsTrigger value="maclinux">Mac/Linux</TabsTrigger>
                        <TabsTrigger value="windows">Windows</TabsTrigger>
                      </TabsList>
                      <TabsContent value="maclinux">
                        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm rounded-lg">
                          <CardHeader className="pb-2">
                            <CardTitle>
                              Setup and Activate Virtual Environment
                            </CardTitle>
                            <CardDescription>
                              Use these commands to set up and activate the
                              virtual environment for your assignment.
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pt-2">
                            <CodeBlock language="bash">
                              {`python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements`}
                            </CodeBlock>
                          </CardContent>
                        </Card>
                      </TabsContent>
                      <TabsContent value="windows">
                        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm rounded-lg">
                          <CardHeader className="pb-2">
                            <CardTitle>
                              Setup and Activate Virtual Environment
                            </CardTitle>
                            <CardDescription>
                              Use these commands to set up and activate the
                              virtual environment for your assignment.
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pt-2">
                            <CodeBlock language="bash">
                              {`python -m venv .venv
.venv\\Scripts\\activate
pip install -r requirements`}
                            </CodeBlock>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
                    <p className="mt-2">
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
                    to="/getting-started/aegis/running-aegis"
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
              the assignment. If you're not inside the environment, you may
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
        <FileTree>
          <FileTreeItem name="aegis" type="folder">
            <FileTreeItem name="src" type="folder">
              <FileTreeItem name="agents" type="folder">
                <FileTreeItem name="example_agent" type="folder">
                  <FileTreeItem name="example_agent.py" />
                  <FileTreeItem name="main.py" />
                </FileTreeItem>
              </FileTreeItem>
            </FileTreeItem>
          </FileTreeItem>
        </FileTree>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Place new agents in the <code>src/agents</code> directory.
          <br />
          Agents must include a <code>main.py</code> file.
        </p>

        <h3 className="mt-4 text-xl font-semibold mb-4 dark:text-white">
          World Structure
        </h3>

        <FileTree>
          <FileTreeItem name="aegis" type="folder">
            <FileTreeItem name="worlds" type="folder">
              <FileTreeItem name="ExampleWorld.world" />
            </FileTreeItem>
          </FileTreeItem>
        </FileTree>
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
