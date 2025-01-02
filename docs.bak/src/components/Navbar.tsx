import { useTheme } from "@/contexts/ThemeContext";
import { Menu, Moon, Sun } from "lucide-react";
import { Link, useLocation } from "react-router";
import LogoWhite from "@/assets/logo-white.png";
import LogoBlack from "@/assets/logo-black.png";
import { docsRoutes } from "@/router/routes/docs";
import { gettingStartedRoutes } from "@/router/routes/getting-started";
import DocsSearch from "./DocsSearch";

interface Props {
  onMobileSidebarToggle: () => void;
  isMobileSidebarOpen: boolean;
}

function Navbar({ onMobileSidebarToggle, isMobileSidebarOpen }: Props) {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const location = useLocation();

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/getting-started", label: "Getting Started" },
    { to: "/docs", label: "API Reference" },
    { to: "/common-errors", label: "Common Errors" },
  ];

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center">
        <img src={isDarkMode ? LogoWhite : LogoBlack} className="h-6 mr-4" />
        <button onClick={onMobileSidebarToggle} className="md:hidden mr-2">
          <Menu
            className={isMobileSidebarOpen ? "text-primary" : "text-gray-600"}
          />
        </button>
      </div>

      <div className="hidden md:flex space-x-6 text-sm text-gray-600 dark:text-gray-400">
        {navLinks.map(({ to, label }) => {
          const isActive =
            location.pathname === to || location.pathname.startsWith(`${to}/`);
          return (
            <Link
              key={to}
              to={to}
              className={`border-b pb-2 ${
                isActive
                  ? "border-light-primary dark:border-dark-primary font-semibold text-gray-800 dark:text-gray-300"
                  : "border-transparent hover:border-gray-300 dark:hover:border-gray-700"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>

      <div className="flex items-center">
        <DocsSearch
          docsRoutes={docsRoutes}
          gettingStartedRoutes={gettingStartedRoutes}
        />
        <button onClick={toggleDarkMode} className="p-2 rounded-full">
          {isDarkMode ? (
            <Sun className="text-yellow-500 hover:text-yellow-300" />
          ) : (
            <Moon className="text-gray-800 hover:text-gray-500" />
          )}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
