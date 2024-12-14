import { ReactNode, useEffect, useRef } from "react";
import { Book } from "lucide-react";
import { useLocation } from "react-router";

interface Props {
  children: ReactNode;
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

function DocPage({ children, title, description, icon: Icon = Book }: Props) {
  const topRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    if (topRef.current) {
      topRef.current.scrollIntoView({
        behavior: "auto",
        block: "start",
      });
    }
  }, [location]);

  return (
    <div ref={topRef} className="mx-auto p-6">
      <div className="flex items-center mb-6 border-b border-gray-200 dark:border-gray-800 pb-4">
        <div>
          <h1 className="flex items-center text-3xl font-bold text-gray-800 dark:text-white">
            <Icon className="mr-2 text-light-primary dark:text-dark-primary" />
            {title}
          </h1>
          {description && (
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              {description}
            </p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

export default DocPage;
