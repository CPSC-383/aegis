import { useRef, useEffect } from "react";
import { useState } from "react";
import { Code, ChevronRight, Info } from "lucide-react";
import APIReference from "./APIReference";
import { motion, AnimatePresence } from "framer-motion";
import CodeBlock from "./CodeBlock";

interface Props {
  name: string;
  description: string;
  parameters?: Array<{
    name: string;
    type: string;
    link?: string;
    description?: string;
    required?: boolean;
  }>;
  returns?: {
    type: string;
    link?: string;
    description?: string;
  };
  example?: string;
}

function MethodDoc({
  name,
  description,
  parameters = [],
  returns,
  example,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const methodDocRef = useRef<HTMLDivElement>(null);

  const contentVariants = {
    hidden: {
      height: 0,
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    visible: {
      height: "auto",
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  useEffect(() => {
    if (isExpanded && methodDocRef.current) {
      setTimeout(() => {
        methodDocRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }, 300);
    }
  }, [isExpanded]);

  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg my-4">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex justify-between items-center p-4 cursor-pointer"
      >
        <div className="flex items-center space-x-2">
          <Code className="text-green-600 dark:text-green-400" size={20} />
          <h5 className="font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-200">
            {name}
          </h5>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-200"
        >
          <ChevronRight className="w-5 h-5" />
        </motion.div>
      </div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            key="content"
            ref={methodDocRef}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={contentVariants}
            className="overflow-hidden"
          >
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              <p className="mb-4 text-gray-600 dark:text-gray-300">
                {description}
              </p>
              {parameters.length > 0 && (
                <div>
                  <h4 className="font-semibold border-b pb-2.5 border-gray-200 dark:border-gray-800 dark:text-white">
                    Parameters:
                  </h4>
                  {parameters.map((param, index) => (
                    <APIReference key={index} {...param} />
                  ))}
                </div>
              )}
              {returns && (
                <div>
                  <h4 className="font-semibold border-b pb-2.5 border-gray-200 dark:border-gray-800 dark:text-white">
                    Returns:
                  </h4>
                  <APIReference {...returns} />
                </div>
              )}
              {example && (
                <div className="rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center dark:text-white">
                    <Info
                      className="mr-2 text-light-primary dark:text-dark-primary"
                      size={16}
                    />
                    Example
                  </h4>
                  <CodeBlock language="python">{example}</CodeBlock>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MethodDoc;
