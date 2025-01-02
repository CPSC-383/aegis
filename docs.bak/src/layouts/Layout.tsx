import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import MobileNavigation from "@/components/MobileNavigation";
import { Outlet, useLocation } from "react-router";
import { apiSections, gettingStartedSections } from "../sections";
import { useTheme } from "@/contexts/ThemeContext";
import { useState } from "react";

function Layout() {
  const { isDarkMode } = useTheme();
  const location = useLocation();
  const isDocsRoute = location.pathname.startsWith("/docs");
  const isGettingStartedRoute =
    location.pathname.startsWith("/getting-started");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div
      className={`dark:bg-dark-main-background bg-light-main-background ${isDarkMode ? "dark" : ""} h-screen`}
      style={{
        backgroundImage: isDarkMode
          ? "radial-gradient(49.63% 57.02% at 58.99% -7.2%, rgba(60, 128, 183, 0.2) 39.4%, rgba(0, 0, 0, 0) 100%)"
          : "radial-gradient(49.63% 57.02% at 58.99% -7.2%, rgba(84, 154, 211, 0.2) 39.4%, rgba(0, 0, 0, 0) 100%)",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="max-h-screen h-screen w-full max-w-5xl mx-auto flex flex-col">
        <Navbar
          onMobileSidebarToggle={toggleMobileSidebar}
          isMobileSidebarOpen={isMobileSidebarOpen}
        />

        <div className="block md:hidden">
          <MobileNavigation
            sections={
              isDocsRoute
                ? apiSections
                : isGettingStartedRoute
                  ? gettingStartedSections
                  : []
            }
            isMobileSidebarOpen={isMobileSidebarOpen}
            onMobileSidebarToggle={toggleMobileSidebar}
          />
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="hidden md:block">
            {(isDocsRoute || isGettingStartedRoute) && (
              <Sidebar
                sections={
                  isDocsRoute
                    ? apiSections
                    : isGettingStartedRoute
                      ? gettingStartedSections
                      : []
                }
              />
            )}
          </div>

          <div className="flex-1 overflow-auto no-scrollbar">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Layout;
