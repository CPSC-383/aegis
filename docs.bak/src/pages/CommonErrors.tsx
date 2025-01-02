import Admonition from "@/components/Admonition";
import CodeBlock from "@/components/CodeBlock";
import DocPage from "@/components/DocPage";
import List from "@/components/List";
import { TriangleAlert } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

function CommonErrors() {
  return (
    <DocPage
      title="Common Errors and Solutions"
      description="Troubleshoot common issues that may arise while working with Aegis."
      icon={TriangleAlert}
    >
      <Admonition type="warning" title="Important">
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Folder Path Restrictions:</strong> Ensure the path to the
            folder you unzipped <strong>does not contain spaces</strong>. For
            example, if a folder is called "CPSC 383", the space will cause some
            undefined behavior when running the system. To avoid this, rename
            parent folders to use underscores or hyphens, such as "CPSC_383" or
            "CPSC-383".
          </li>
          <li>
            <strong>Python Version Requirements:</strong> Only Python versions
            3.12.x are supported. Please make sure your Python version matches
            this requirement.
          </li>
        </ul>
      </Admonition>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="setup-runtime-issues">
          <AccordionTrigger className="text-2xl font-semibold dark:text-white">
            Setup and Runtime Issues
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">
                    Cannot activate venv because computer is not allowed to run
                    scripts (Windows only)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    <strong>Problem:</strong> Unable to activate virtual
                    environment due to script execution restrictions.
                  </p>
                  <Accordion type="single" collapsible>
                    <AccordionItem value="solution-steps">
                      <AccordionTrigger>View Solution Steps</AccordionTrigger>
                      <AccordionContent>
                        <ol className="list-decimal pl-6 space-y-2">
                          <li>Open PowerShell as administrator</li>
                          <li>Run the following command:</li>
                          <CodeBlock language="bash">
                            Set-ExecutionPolicy -ExecutionPolicy RemoteSigned
                          </CodeBlock>
                          <li>Hit Enter, type 'A', and hit Enter again</li>
                        </ol>
                        <p className="mt-4">
                          Now, close and reopen your code editor, and you should
                          be able to run the activate script to set up your
                          venv.
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">
                    Cannot guarantee aegis is free of malware (Mac Only)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    <strong>Problem:</strong> Unable to activate the Aegis
                    client on macOS because the system flags it as unsafe or
                    unverified.
                  </p>
                  <Accordion type="single" collapsible>
                    <AccordionItem value="solution-steps">
                      <AccordionTrigger>View Solution Steps</AccordionTrigger>
                      <AccordionContent>
                        <ol className="list-decimal pl-6 space-y-2">
                          <li>
                            Open System Settings and navigate to Security &
                            Privacy
                          </li>
                          <li>
                            Scroll down until you see a message stating the
                            application was blocked to protect your mac
                          </li>
                          <li>Click Open Anyway to proceed</li>
                        </ol>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">
                    Cannot import override from module typing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    <strong>Problem:</strong> An error occurs when trying to
                    import override from the typing module.
                  </p>
                  <Accordion type="single" collapsible>
                    <AccordionItem value="solution-steps">
                      <AccordionTrigger>View Solution Steps</AccordionTrigger>
                      <AccordionContent>
                        <ol className="list-decimal pl-6 space-y-2">
                          <li>Delete old Python versions</li>
                          <li>Install the latest Python 3.12 version</li>
                          <li>Recreate the virtual environment:</li>
                          <Tabs defaultValue="maclinux" className="mt-4">
                            <TabsList className="bg-light-main-background dark:bg-dark-main-background border border-gray-200 dark:border-gray-800 shadow-sm">
                              <TabsTrigger value="maclinux">
                                Mac/Linux
                              </TabsTrigger>
                              <TabsTrigger value="windows">Windows</TabsTrigger>
                            </TabsList>
                            <TabsContent value="maclinux">
                              <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
                                <CardHeader className="pb-2">
                                  <CardTitle>Setup Command</CardTitle>
                                  <CardDescription>
                                    Run this command to set up your virtual
                                    environment.
                                  </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-2">
                                  <CodeBlock language="bash">
                                    {`python3 setup.py --no-client`}
                                  </CodeBlock>
                                </CardContent>
                              </Card>
                            </TabsContent>
                            <TabsContent value="windows">
                              <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
                                <CardHeader className="pb-2">
                                  <CardTitle>Setup Command</CardTitle>
                                  <CardDescription>
                                    Run this command to set up your virtual
                                    environment.
                                  </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-2">
                                  <CodeBlock language="bash">
                                    {`python setup.py --no-client`}
                                  </CodeBlock>
                                </CardContent>
                              </Card>
                            </TabsContent>
                          </Tabs>
                        </ol>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">
                    Unable to import websocket-server or other required
                    packages.
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    <strong>Problem:</strong> Package import errors
                  </p>
                  <Accordion type="single" collapsible>
                    <AccordionItem value="solution-steps">
                      <AccordionTrigger>View Solution Steps</AccordionTrigger>
                      <AccordionContent>
                        <ol className="list-decimal pl-6 space-y-2">
                          <li>Install with setup script</li>
                          <div>
                            With the virtual environment activated, run the
                            Python setup script:
                            <CodeBlock language="bash">
                              python setup.py --no-venv --no-client
                            </CodeBlock>
                            This should install the required packages. You will
                            receive errors if a package could not be installed.
                          </div>
                          <li>Install packages manually</li>
                          <div>
                            Alternatively, try installing the package directly
                            by running:
                            <CodeBlock language="bash">
                              {`pip install <package name>`}
                            </CodeBlock>
                          </div>
                        </ol>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="simulation-client-issues">
          <AccordionTrigger className="text-2xl font-semibold dark:text-white">
            Simulation and Client Issues
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">
                    Game runs, but example_agent.py shows import errors for
                    aegis modules
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    <strong>Problem:</strong> The game runs, but your IDE shows
                    import errors for aegis packages.
                  </p>
                  <Accordion type="single" collapsible>
                    <AccordionItem value="solution-steps">
                      <AccordionTrigger>View Solution Steps</AccordionTrigger>
                      <AccordionContent>
                        <ol className="list-decimal pl-6 space-y-2">
                          <li>
                            While editing a Python file, check the bottom right
                            of your IDE. Click on the current Python interpreter
                          </li>
                          <li>
                            If the interpreter points to the venv, click it.
                          </li>
                          <li>
                            If not, manually set your IDE to use the venv's
                            Python interpreter:
                            <ol className="list-decimal pl-6 space-y-2 mt-2">
                              <li>
                                Find the option to 'Enter interpreter path'
                              </li>
                              <li>
                                Navigate to the venv folder, then into /Scripts/
                                on Windows or /bin/ on macOS/Linux
                              </li>
                              <li>Select the Python executable there</li>
                            </ol>
                          </li>
                        </ol>
                        <p className="mt-4">
                          Restart your IDE, and the import errors should go
                          away.
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">
                    Running a game gives an AegisParserException
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    <strong>Problem:</strong> Receiving an AegisParserException
                    when running a game.
                  </p>
                  <p className="mt-2">
                    <strong>Solution:</strong> This is most likely caused by
                    your agent throwing an exception during the simulation.
                    Comment out code to isolate the problematic section.
                  </p>
                </CardContent>
              </Card>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </DocPage>
  );
}

export default CommonErrors;
