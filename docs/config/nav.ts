import { isAssignment1 } from "@/lib/utils";

export const navConfig = {
  mainNav: [
    { title: "Home", href: "/", path: "/" },
    {
      title: "Getting Started",
      href: "/getting-started/installation",
      path: "/getting-started",
    },
    { title: "API Reference", href: "/docs/intro", path: "/docs" },
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
      ],
    },
    {
      title: "Aegis",
      items: [
        {
          title: "Agents",
          href: "/getting-started/aegis/agents",
        },
        {
          title: "System",
          href: "/getting-started/aegis/system",
        },
        {
          title: "Running Aegis",
          href: "/getting-started/aegis/running-aegis",
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
          href: "/docs/intro",
        },
      ],
    },
    {
      title: "Agent",
      items: [
        {
          title: "Agent Controller",
          href: "/docs/agent/agent-controller",
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
          title: "Save Surv",
          href: "/docs/agent-commands/save-surv",
        },
      ],
    },
  ],
};
