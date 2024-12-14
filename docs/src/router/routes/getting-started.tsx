import { RouteObject, Navigate } from "react-router-dom";
import {
  Installation,
  System,
  Agents,
  RunningAegis,
  Client,
} from "@/pages/getting_started";

export const gettingStartedRoutes: RouteObject[] = [
  {
    path: "getting-started",
    children: [
      {
        index: true,
        element: <Navigate to="/getting-started/installation" replace />,
      },
      {
        path: "installation",
        element: <Installation />,
      },
      {
        path: "aegis",
        children: [
          {
            path: "system",
            element: <System />,
          },
          {
            path: "agents",
            element: <Agents />,
          },
          {
            path: "running-aegis",
            element: <RunningAegis />,
          },
        ],
      },
      {
        path: "client",
        children: [
          {
            path: "client",
            element: <Client />,
          },
        ],
      },
    ],
  },
];
