import DocPage from "@/components/DocPage";
import { Monitor } from "lucide-react";
import List from "@/components/List";
import Admonition from "@/components/Admonition";
import WorldTypes from "/world_types.png";

function Client() {
  return (
    <DocPage
      title="Aegis Client"
      description="Comprehensive guide to navigating and using the Aegis client interface"
      icon={Monitor}
    >
      <section className="mb-8">
        <h2 className="text-2xl font-semibold dark:text-white">
          Getting Started
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mt-2 mb-4">
          The Aegis client is an Electron-based desktop application designed to
          streamline your simulation management and interaction. This guide will
          help you understand its features and functionality.
        </p>

        <Admonition type="info" title="Initial Setup">
          Before using the client, ensure you have set up the Aegis path by
          clicking the "Setup Aegis Path" button and selecting the aegis root
          directory.
        </Admonition>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold border-b pb-2.5 border-gray-200 dark:border-gray-800 dark:text-white">
          Client Tabs
        </h2>

        <List
          items={[
            {
              title: "Aegis Tab",
              description:
                "Launch Aegis after selecting a world, and specifying rounds.",
            },
            {
              title: "Agents Tab",
              description: "Connect the single agent needed for assignment 1.",
            },
            {
              title: "Game Tab",
              description: "View simulation statistics during the game.",
            },
            {
              title: "Editor Tab",
              description: "Create and customize world maps.",
            },
            {
              title: "Settings Tab",
              description:
                "Reconfigure Aegis code path if you move the directory or toggle move cost.",
            },
          ]}
        />
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold border-b pb-2.5 border-gray-200 dark:border-gray-800 dark:text-white">
          World Editor Brushes
        </h2>

        <List
          items={[
            {
              title: "Special Cells Brush",
              description: (
                <p>
                  Add special map elements like spawns, fire, killer, and
                  charging cells.
                </p>
              ),
            },
            {
              title: "Move Cost Brush",
              description:
                "Customize cell movement costs from 2-5 or a custom value, with visual color intensity indication.",
            },
            {
              title: "Stack Content Brush",
              description:
                "Add objects to cell stacks. For assignment 1, only one survivor can be placed on the world.",
            },
            {
              title: "View Brush",
              description: "Inspect cell details and properties.",
            },
          ]}
        />

        <Admonition type="tip" title="Editing Tips">
          Left-click to place objects, right-click to delete. For deleting
          specific objects, ensure you've selected the correct brush type.
        </Admonition>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold border-b pb-2.5 border-gray-200 dark:border-gray-800 dark:text-white">
          Client UI Components
        </h2>

        <List
          items={[
            {
              title: "World Objects",
              description: (
                <>
                  <p>
                    Comprehensive visual representation of world elements
                    including survivors, groups, rubble, and special cells.
                  </p>
                  <p>
                    Small squares indicate survivors (light blue) and survivor
                    groups (dark blue) in cell stacks, providing quick visual
                    information about cell contents.
                  </p>
                  <img src={WorldTypes} />
                  <ul>
                    <li>1. Survivor</li>
                    <li>2. Survivor Group</li>
                    <li>3. Rubble</li>
                    <li>4. Charging Cell</li>
                    <li>5. Killer Cell</li>
                    <li>6. Fire Cell</li>
                    <li>7. Spawn Cell</li>
                  </ul>
                </>
              ),
            },
            {
              title: "Timeline",
              description: (
                <>
                  <p>Navigation and control for simulation playback.</p>
                  <List
                    items={[
                      {
                        title: "Jump Between Rounds",
                        description: "Click timeline to navigate directly",
                      },
                      {
                        title: "Previous/Next Buttons",
                        description: "Move backward or forward by one round",
                      },
                      {
                        title: "Play/Pause",
                        description: "Control simulation playback",
                      },
                      {
                        title: "Minimize Button",
                        description: "Hide timeline to view background",
                      },
                      {
                        title: "Keyboard Shortcuts",
                        description: (
                          <>
                            <ul>
                              <li>
                                Use <strong>J</strong>/<strong>L</strong> or{" "}
                                <strong>left</strong>/<strong>right</strong>{" "}
                                arrow keys to move between rounds
                              </li>
                              <li>
                                Press <strong>Space</strong> or{" "}
                                <strong>K</strong> to play/pause
                              </li>
                              <li>
                                Press <strong>M</strong> to minimize/maximize
                                the timeline
                              </li>
                            </ul>
                          </>
                        ),
                      },
                    ]}
                  />
                </>
              ),
            },
            {
              title: "Info Panels",
              description: (
                <List
                  items={[
                    {
                      title: "Cell Panel",
                      description:
                        "Displays cell type, move cost, present agents, and layer information.",
                    },
                    {
                      title: "Agent Panel",
                      description:
                        "Shows detailed agent information including location, energy, latest command, and current layer details.",
                    },
                  ]}
                />
              ),
            },
          ]}
        />
      </section>
    </DocPage>
  );
}

export default Client;
