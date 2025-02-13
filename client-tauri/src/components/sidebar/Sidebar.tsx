import { createScaffold } from "@/services";

function Sidebar() {
  const scaffold = createScaffold();
  const { aegisPath } = scaffold;

  console.log("AEGIS PATH: " + aegisPath);

  return <div>Hello Sidebar</div>;
}

export default Sidebar;
