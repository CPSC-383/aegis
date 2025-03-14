import { isAssignment1 } from "@/lib/utils";

export const navConfig = {
  mainNav: [
    { title: "Home", href: "/", path: "/" },
    {
      title: "Getting Started",
      href: "/getting-started/installation",
      path: "/getting-started",
    },
    {
      title: "API Reference",
      href: isAssignment1() ? "/docs/intro" : "/docs/intro-a3",
      path: "/docs",
    },
    { title: "Common Errors", href: "/common-errors", path: "/common-errors" },
  ],
  gettingStartedNav: [
    {
      title: "Getting Started",
      items: [
        {
          title: "Installation",
          href: "/getting-started/installation",
        },
        {
          title: "Running Aegis",
          href: "/getting-started/running-aegis",
        },
      ],
    },
    {
      title: "Aegis",
      items: [
        {
          title: "Agents",
          href: isAssignment1()
            ? "/getting-started/aegis/agents"
            : "/getting-started/aegis/agents-a3",
        },
        {
          title: "System",
          href: "/getting-started/aegis/system",
        },
        {
          title: "File Structure",
          href: "/getting-started/aegis/file-structure",
        },
      ],
    },
    {
      title: "Client",
      items: [
        {
          title: "Client",
          href: "/getting-started/client",
        },
      ],
    },
  ],
  docsNav: [
    {
      title: "Getting Started",
      items: [
        {
          title: "Introduction",
          href: isAssignment1() ? "/docs/intro" : "/docs/intro-a3",
        },
      ],
    },
    {
      title: "Agent",
      items: [
        {
          title: "Agent Controller",
          href: isAssignment1()
            ? "/docs/agent/agent-controller"
            : "/docs/agent/agent-controller-a3",
        },
      ],
    },
    {
      title: "Common",
      items: [
        {
          title: "AgentID",
          href: "/docs/common/agent-id",
          disabled: isAssignment1(),
        },
        {
          title: "AgentID List",
          href: "/docs/common/agent-id-list",
          disabled: isAssignment1(),
        },
        {
          title: "Direction",
          href: "/docs/common/direction",
        },
        {
          title: "Life Signals",
          href: "/docs/common/life-signals",
          disabled: isAssignment1(),
        },
        {
          title: "Location",
          href: "/docs/common/location",
        },
      ],
    },
    {
      title: "World",
      items: [
        {
          title: "World",
          href: "/docs/world/world",
        },
        {
          title: "Cell",
          href: "/docs/world/cell",
        },
        {
          title: "Cell Info",
          href: "/docs/world/cell-info",
          disabled: isAssignment1(),
        },
      ],
    },
    {
      title: "Agent Commands",
      items: [
        {
          title: "End Turn",
          href: "/docs/agent-commands/end-turn",
        },
        {
          title: "Move",
          href: "/docs/agent-commands/move",
        },
        {
          title: "Observe",
          href: "/docs/agent-commands/observe",
          disabled: isAssignment1(),
        },
        {
          title: "Predict",
          href: "/docs/agent-commands/predict",
          disabled: isAssignment1(),
        },
        {
          title: "Save Surv",
          href: "/docs/agent-commands/save-surv",
        },
        {
          title: "Send Message",
          href: "/docs/agent-commands/send-message",
          disabled: isAssignment1(),
        },
        {
          title: "Sleep",
          href: "/docs/agent-commands/sleep",
        },
        {
          title: "Team Dig",
          href: "/docs/agent-commands/team-dig",
          disabled: isAssignment1(),
        },
      ],
    },
    {
      title: "Aegis Commands",
      disabled: isAssignment1(),
      items: [
        {
          title: "Observe Result",
          href: "/docs/aegis-commands/observe-result",
        },
        {
          title: "Predict Result",
          href: "/docs/aegis-commands/predict-result",
        },
        {
          title: "Save Surv Result",
          href: "/docs/aegis-commands/save-surv-result",
        },
        {
          title: "Send Message Result",
          href: "/docs/aegis-commands/send-message-result",
        },
      ],
    },
  ],
};
