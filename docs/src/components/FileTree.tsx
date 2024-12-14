import { Folder, File } from "lucide-react";

interface FileTreeNode {
  name: string;
  type: "folder" | "file";
  children?: FileTreeNode[];
}

interface FileTreeProps {
  data: FileTreeNode[];
}

function FileTree({ data }: FileTreeProps) {
  const renderTree = (nodes: FileTreeNode[], depth: number = 0) => {
    return nodes.map((node) => {
      return (
        <div
          key={node.name}
          className="text-gray-600 dark:text-gray-300 font-mono"
        >
          <div className="flex items-center whitespace-nowrap">
            <div style={{ marginLeft: `${depth}rem` }}>
              {node.type === "folder" ? (
                <Folder className="w-4 h-4 mr-2 text-light-primary dark:text-dark-primary" />
              ) : (
                <File className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-300" />
              )}
            </div>

            <span
              className={
                node.type === "folder"
                  ? "text-light-primary dark:text-dark-primary"
                  : ""
              }
            >
              {node.name}
              {node.type === "folder" ? "/" : ""}
            </span>
          </div>

          {node.children &&
            node.children.length > 0 &&
            renderTree(node.children, depth + 1)}
        </div>
      );
    });
  };

  return (
    <div className="bg-[#f3f4f6] dark:bg-[#0F1117] p-4 rounded-md overflow-x-auto">
      {renderTree(data)}
    </div>
  );
}

export default FileTree;
