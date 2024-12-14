import { Link, useLocation } from "react-router";

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
}

function Sidebar({ sections }: Props) {
  const location = useLocation();

  return (
    <div className="w-64 h-screen p-4 overflow-y-auto">
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
                  className={`block py-2 rounded-md pl-4
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
    </div>
  );
}

export default Sidebar;
