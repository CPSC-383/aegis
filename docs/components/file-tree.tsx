import React from "react";
import { Folder, File, FolderOpen } from "lucide-react";
import { cn } from "@/lib/cn";

interface Props {
  name: string;
  type?: string;
  children?: React.ReactNode;
}

const TreeItem = ({ name, type = "file", children }: Props) => {
  return (
    <div
      className={cn(
        "relative",
        children &&
        type === "folder" &&
        "before:absolute before:left-[10px] before:top-8 before:bottom-0 before:w-px before:bg-cyan-700/40",
      )}
    >
      <div
        className={cn(
          "flex items-center space-x-2 py-1.5 rounded-md select-none",
          "cursor-default",
          "text-cyan-300 hover:text-cyan-400",
          "font-mono text-sm",
          "transition-colors duration-200",
        )}
      >
        {type === "folder" ? (
          children ? (
            <FolderOpen className="w-5 h-5 text-cyan-400" />
          ) : (
            <Folder className="w-5 h-5 text-cyan-500" />
          )
        ) : (
          <File className="w-5 h-5 text-slate-400" />
        )}
        <span className="truncate">{name}</span>
      </div>
      {children && <div className="pl-8 border-l border-cyan-700/30 mt-1 ml-2">{children}</div>}
    </div>
  );
};

const Tree = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="border border-cyan-700/40 bg-slate-900/70 rounded-lg p-4 mt-4 shadow-md shadow-cyan-700/20">
      {children}
    </div>
  );
};

export { Tree, TreeItem };
