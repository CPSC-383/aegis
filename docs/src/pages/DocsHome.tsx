import { Outlet } from "react-router";

function DocsHome() {
  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Documentation</h1>
      <Outlet />
    </div>
  );
}

export default DocsHome;
