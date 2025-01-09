export const navConfig = {
  mainNav: [
    { title: "Home", href: "/" },
    { title: "Getting Started", href: "/getting-started" },
    { title: "API Reference", href: "/docs" },
    { title: "Common Errors", href: "/common-erros" },
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
          title: "Direction",
          href: "/docs/common/direction",
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
