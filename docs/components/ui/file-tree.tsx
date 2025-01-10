import React from "react";
import { Folder, File, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

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
          "before:absolute before:left-[7px] before:top-7 before:bottom-0 before:w-px before:bg-zinc-200 dark:before:bg-zinc-800",
      )}
    >
      <div
        className={cn(
          "flex items-center space-x-2 py-1 rounded-md",
          "hover:bg-accent/50 cursor-default",
        )}
      >
        {type === "folder" ? (
          children ? (
            <FolderOpen className="w-4 h-4" />
          ) : (
            <Folder className="w-4 h-4" />
          )
        ) : (
          <File className="w-4 h-4" />
        )}
        <span className="text-sm">{name}</span>
      </div>
      {children && <div className="pl-6">{children}</div>}
    </div>
  );
};

const Tree = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="border border-zinc-200 dark:border-zinc-800 shadow-sm p-4 mt-4 rounded-lg text-zinc-600 dark:text-zinc-300">
      {children}
    </div>
  );
};

export { Tree, TreeItem };
