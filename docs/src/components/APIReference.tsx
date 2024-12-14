import { ReactNode, useState } from "react";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router";

interface Props {
  name?: string;
  nameLink?: string;
  type?: string;
  link?: string;
  description?: string;
  required?: boolean;
  defaultValue?: string | number | null;
  children?: ReactNode;
}

function APIReference({
  name,
  nameLink,
  type,
  link,
  description,
  required = false,
  defaultValue = null,
  children,
}: Props) {
  const [showChildren, setShowChildren] = useState(false);

  const toggleChildren = () => setShowChildren(!showChildren);

  return (
    <div className="py-6 border-gray-200 dark:border-gray-800 border-b last:border-b-0">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {name && (
            <h5 className="font-bold text-light-primary dark:text-dark-primary">
              {nameLink ? <Link to={nameLink}>{name}</Link> : <div>{name}</div>}
            </h5>
          )}
          {type && (
            <span className="text-sm px-2 py-0.5 rounded-md bg-gray-100/50 dark:bg-white/5 text-gray-600 dark:text-gray-200">
              {link ? <Link to={link}>{type}</Link> : <div>{type}</div>}
            </span>
          )}
          {required && (
            <span className="text-sm px-2 py-0.5 rounded-md bg-red-100/50 dark:bg-red-400/10 text-red-600 dark:text-red-300">
              required
            </span>
          )}
        </div>
        {defaultValue !== null && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Default: {defaultValue}
          </span>
        )}
      </div>
      {description && (
        <p className="mt-2 text-gray-600 dark:text-gray-300">{description}</p>
      )}

      {children && (
        <div className="mt-4 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-200 cursor-pointer">
            <button onClick={toggleChildren} className="flex items-center">
              <motion.div
                animate={{ rotate: showChildren ? 90 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronRight className="w-4 h-4" />
              </motion.div>
              <div className="ml-3">
                {showChildren
                  ? "Hide Child Attributes"
                  : "Show Child Attributes"}
              </div>
            </button>
          </div>

          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: showChildren ? "auto" : 0,
              opacity: showChildren ? 1 : 0,
            }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default APIReference;
