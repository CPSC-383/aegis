import Admonition from "@/components/Admonition";
import CodeBlock from "@/components/CodeBlock";
import DocPage from "@/components/DocPage";
import OrderedList from "@/components/OrderedList";
import UnorderedList from "@/components/UnorderedList";
import { TriangleAlert } from "lucide-react";

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

      <section className="mb-8 mt-8">
        <h2 className="text-2xl font-semibold border-b pb-2.5 border-gray-200 dark:border-gray-800 dark:text-white">
          Setup and Runtime Issues
        </h2>

        <UnorderedList
          items={[
            {
              title:
                "Cannot activate venv because computer is not allowed to run scripts (Windows only)",
              description: (
                <div>
                  <p>
                    <strong>Problem:</strong> Unable to activate virtual
                    environment due to script execution restrictions.
                  </p>
                  <p>
                    <strong>Solution:</strong> Change execution policy to allow
                    running the script that starts up the venv.
                  </p>
                  <p>
                    <strong>Steps:</strong>
                  </p>
                  <div className="ml-4">
                    <OrderedList
                      items={[
                        {
                          title: "Type 'powershell' into the start menu",
                        },
                        {
                          title:
                            "Click 'Run as administrator' on the right side",
                        },
                        {
                          title: "Paste this command into the terminal:",
                          description: (
                            <CodeBlock language="bash">
                              Set-ExecutionPolicy -ExecutionPolicy RemoteSigned
                            </CodeBlock>
                          ),
                        },
                        {
                          title: "Hit Enter, type 'A', and hit Enter again",
                        },
                      ]}
                    />
                  </div>
                  <p>
                    Now, close and reopen your code editor, and you should be
                    able to run the activate script to set up your venv.
                  </p>
                </div>
              ),
            },
            {
              title: "Cannot guarantee aegis is free of malware (Mac Only)",
              description: (
                <div>
                  <p>
                    <strong>Problem:</strong> Unable to activate the Aegis
                    client on macOS because the system flags it as unsafe or
                    unverified.
                  </p>
                  <p>
                    <strong>Solution:</strong> Adjust system settings to allow
                    macOS to bypass the verification for the application.
                  </p>
                  <p>
                    <strong>Steps:</strong>
                  </p>
                  <div className="ml-4">
                    <OrderedList
                      items={[
                        {
                          title:
                            "Open System Settings and navigate to Security & Privacy",
                        },
                        {
                          title:
                            "Scroll down until you see a message stating the application was blocked to protect your mac",
                        },
                        {
                          title: "Click Open Anyway to proceed",
                        },
                      ]}
                    />
                  </div>
                </div>
              ),
            },
            {
              title: "Cannot import override from module typing",
              description: (
                <div>
                  <p>
                    <strong>Problem:</strong> An error occurs when trying to
                    import override from the typing module.
                  </p>
                  <p>
                    <strong>Solution:</strong> You are using a Python version
                    older than 3.12.
                  </p>
                  <p>
                    <strong>Steps:</strong>
                  </p>
                  <div className="ml-4">
                    <OrderedList
                      items={[
                        {
                          title: "Delete old Python versions",
                        },
                        {
                          title: "Install the latest Python 3.12 version",
                        },
                        {
                          title: "Recreate the virtual environment",
                          description: (
                            <CodeBlock language="bash">
                              python setup.py --no-client
                            </CodeBlock>
                          ),
                        },
                      ]}
                    />
                  </div>
                </div>
              ),
            },
            {
              title: "ImportError for websocket-server or other packages",
              description: (
                <div>
                  <p>
                    <strong>Problem:</strong> Unable to import websocket-server
                    or other required packages.
                  </p>
                  <p>
                    <strong>Solution:</strong> Try the following steps, as one
                    of these should fix the issue:
                  </p>
                  <div className="ml-4">
                    <UnorderedList
                      items={[
                        {
                          title: "Install with setup script",
                          description: (
                            <div>
                              With the virtual environment activated, run the
                              Python setup script:
                              <CodeBlock language="bash">
                                python setup.py --no-venv --no-client
                              </CodeBlock>
                              This should install the required packages. You
                              will receive errors if a package could not be
                              installed.
                            </div>
                          ),
                        },
                        {
                          title: "Install packages manually",
                          description: (
                            <div>
                              Alternatively, try installing the package directly
                              by running:
                              <CodeBlock language="bash">
                                {`pip install <package name>`}
                              </CodeBlock>
                            </div>
                          ),
                        },
                      ]}
                    />
                  </div>
                </div>
              ),
            },
          ]}
        />
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold border-b pb-2.5 border-gray-200 dark:border-gray-800 dark:text-white">
          Simulation and Client Issues
        </h2>

        <UnorderedList
          items={[
            {
              title:
                "Game runs, but example_agent.py shows import errors for aegis modules",
              description: (
                <div>
                  <p>
                    <strong>Problem:</strong> The game runs, but your IDE shows
                    import errors for aegis packages.
                  </p>
                  <p>
                    <strong>Solution:</strong> This occurs because the Python
                    interpreter in your IDE is not correctly pointing to the
                    virtual environment.
                  </p>
                  <p>
                    <strong>Steps:</strong>
                  </p>
                  <OrderedList
                    items={[
                      {
                        title:
                          "While editing a Python file, check the bottom right of your IDE. Click on the current Python interpreter",
                      },
                      {
                        title:
                          "If the interpreter points to the venv, click it. Restart your IDE, and the import errors should disappear",
                      },
                      {
                        title:
                          "If not, manually set your IDE to use the venv's Python interpreter: ",
                        description: (
                          <OrderedList
                            items={[
                              {
                                title:
                                  "Find the option to 'Enter interpreter path'",
                              },
                              {
                                title:
                                  "Navigate to the venv folder, then into /Scripts/ on Windows or /bin/ on macOS/Linux",
                              },
                              {
                                title:
                                  "Select the Python executable there (python.exe on Windows, python3 on macOS/Linux)",
                              },
                            ]}
                          />
                        ),
                      },
                      {
                        title:
                          "Restart your IDE, and the import errors should go away.",
                      },
                    ]}
                  />
                </div>
              ),
            },
            {
              title: "Running a game gives an AegisParserException",
              description: (
                <div>
                  <p>
                    <strong>Problem:</strong> Receiving an AegisParserException
                    when running a game.
                  </p>
                  <p>
                    <strong>Solution:</strong> This is most likely caused by
                    your agent throwing an exception during the simulation.
                  </p>
                  <p>
                    <strong>Steps:</strong> Try commenting out code until you no
                    longer see the error to isolate the problematic code.
                  </p>
                </div>
              ),
            },
          ]}
        />
      </section>
    </DocPage>
  );
}

export default CommonErrors;
