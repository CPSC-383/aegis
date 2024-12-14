import { RouteObject, Navigate } from "react-router-dom";
import { DirectionDocs, LocationDocs } from "@/pages/docs/common";
import { WorldDocs, CellDocs } from "@/pages/docs/world";
import {
  EndTurnDocs,
  MoveDocs,
  SaveSurvDocs,
} from "@/pages/docs/agent_commands";
import AgentControllerDocs from "@/pages/docs/agent/AgentControllerDocs";
import APIIntro from "@/pages/APIIntro";

export const docsRoutes: RouteObject[] = [
  {
    path: "docs",
    children: [
      {
        index: true,
        element: <Navigate to="/docs/intro" replace />,
      },
      {
        path: "intro",
        element: <APIIntro />,
      },
      {
        path: "common",
        children: [
          {
            path: "location",
            element: <LocationDocs />,
          },
          {
            path: "direction",
            element: <DirectionDocs />,
          },
        ],
      },
      {
        path: "world",
        children: [
          {
            path: "world",
            element: <WorldDocs />,
          },
          {
            path: "cell",
            element: <CellDocs />,
          },
        ],
      },
      {
        path: "agent-commands",
        children: [
          {
            path: "end-turn",
            element: <EndTurnDocs />,
          },
          {
            path: "move",
            element: <MoveDocs />,
          },
          {
            path: "save-surv",
            element: <SaveSurvDocs />,
          },
        ],
      },
      {
        path: "agent",
        children: [
          {
            path: "agent-controller",
            element: <AgentControllerDocs />,
          },
        ],
      },
    ],
  },
];
