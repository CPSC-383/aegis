import { Link, useLocation } from "react-router";
import { X, Book } from "lucide-react";

interface Subsection {
  key: string;
  title: string;
  link: string;
}

interface Section {
  key: string;
  title: string;
  subsections?: Subsection[];
}

interface Props {
  sections: Section[];
  isMobileSidebarOpen: boolean;
  onMobileSidebarToggle: () => void;
}

function MobileNavigation({
  sections,
  isMobileSidebarOpen,
  onMobileSidebarToggle,
}: Props) {
  const location = useLocation();
  const isDocsRoute = location.pathname.startsWith("/docs");

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/getting-started", label: "Getting Started" },
    { to: "/docs", label: "API Reference" },
    { to: "/common-errors", label: "Common Errors" },
  ];

  return (
    <div
      className={`fixed top-0 left-0 w-72 h-screen py-7 pl-6 bg-light-main-background dark:bg-dark-main-background shadow-md md:hidden transform ${
        isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 z-50 text-gray-600 dark:text-gray-400 overflow-y-auto`}
    >
      <button
        onClick={onMobileSidebarToggle}
        className="absolute top-5 right-5"
      >
        <X className="text-gray-800 dark:text-gray-300" />
      </button>

      <div>
        {navLinks.map(({ to, label }) => {
          const isActive =
            location.pathname === to || location.pathname.startsWith(`${to}/`);
          return (
            <Link
              key={to}
              to={to}
              onClick={onMobileSidebarToggle}
              className={`flex items-center py-3 ${isActive && "font-semibold text-gray-800 dark:text-gray-300"}`}
            >
              <Book
                className={`mr-3 ${isActive ? "text-light-primary dark:text-dark-primary hover:text-light-primary hover:dark:text-dark-primary" : "text-gray-600 dark:text-gray-400"}`}
              />
              {label}
            </Link>
          );
        })}
      </div>

      {isDocsRoute && (
        <>
          {sections.map((section) => (
            <div key={section.key} className="mt-8">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900 dark:text-gray-200 pl-4 mb-3">
                  {section.title}
                </span>
              </div>
              {section.subsections && (
                <div>
                  {section.subsections.map((subsection) => (
                    <Link
                      key={subsection.key}
                      to={subsection.link}
                      onClick={onMobileSidebarToggle}
                      className={`block py-2 rounded-md pl-4 mr-8 
                  ${
                    location.pathname === subsection.link
                      ? "bg-light-background text-light-primary dark:bg-dark-background dark:text-dark-primary font-semibold"
                      : "text-gray-700 dark:text-gray-400 hover:bg-gray-600/5 dark:hover:bg-gray-200/5 hover:text-gray-900 dark:hover:text-gray-300"
                  }
                  `}
                    >
                      {subsection.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default MobileNavigation;
