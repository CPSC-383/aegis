import React, { useState, ReactNode } from "react";

interface SystemSwitcherProps {
  children: {
    macLinux: ReactNode;
    windows: ReactNode;
    linux?: ReactNode;
  };
}

const SystemSwitcher: React.FC<SystemSwitcherProps> = ({ children }) => {
  const [currentSystem, setCurrentSystem] = useState<
    "macLinux" | "windows" | "linux"
  >("macLinux");

  return (
    <div className="w-full bg-light-main-background dark:bg-dark-main-background rounded-lg my-4 border border-gray-200 dark:border-gray-800">
      <div className="flex items-center space-x-4 p-2 border-b pb-2.5 border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setCurrentSystem("macLinux")}
          className={`flex items-center px-4 py-2 rounded-md ${
            currentSystem === "macLinux"
              ? "bg-light-background text-light-primary dark:bg-dark-background dark:text-dark-primary font-medium"
              : "text-gray-700 dark:text-gray-400 hover:bg-gray-600/5 dark:hover:bg-gray-200/5 hover:text-gray-900 dark:hover:text-gray-300"
          }`}
        >
          {children.linux ? "Mac" : "Mac/Linux"}
        </button>
        <button
          onClick={() => setCurrentSystem("windows")}
          className={`flex items-center px-4 py-2 rounded-md ${
            currentSystem === "windows"
              ? "bg-light-background text-light-primary dark:bg-dark-background dark:text-dark-primary font-medium"
              : "text-gray-700 dark:text-gray-400 hover:bg-gray-600/5 dark:hover:bg-gray-200/5 hover:text-gray-900 dark:hover:text-gray-300"
          }`}
        >
          Windows
        </button>
        {children.linux && (
          <button
            onClick={() => setCurrentSystem("linux")}
            className={`flex items-center px-4 py-2 rounded-md ${
              currentSystem === "linux"
                ? "bg-light-background text-light-primary dark:bg-dark-background dark:text-dark-primary font-medium"
                : "text-gray-700 dark:text-gray-400 hover:bg-gray-600/5 dark:hover:bg-gray-200/5 hover:text-gray-900 dark:hover:text-gray-300"
            }`}
          >
            Linux
          </button>
        )}
      </div>

      <div className="p-4">
        {currentSystem === "macLinux"
          ? children.macLinux
          : currentSystem === "windows"
            ? children.windows
            : children.linux}
      </div>
    </div>
  );
};

export default SystemSwitcher;
