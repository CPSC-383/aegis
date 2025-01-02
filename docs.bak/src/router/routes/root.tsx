import { RouteObject } from "react-router-dom";
import Layout from "@/layouts/Layout";
import Home from "@/pages/Home";
import CommonErrors from "@/pages/CommonErrors";
import { docsRoutes } from "./docs";
import { gettingStartedRoutes } from "./getting-started";

export const rootRoutes: RouteObject[] = [
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      ...docsRoutes,
      ...gettingStartedRoutes,
      {
        path: "common-errors",
        element: <CommonErrors />,
      },
    ],
  },
  {
    path: "*",
    element: <div>404 - Not Found</div>,
  },
];
