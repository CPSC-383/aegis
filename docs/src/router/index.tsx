import { createHashRouter } from "react-router-dom";
import { rootRoutes } from "./routes/root";

export const router = createHashRouter(rootRoutes);
