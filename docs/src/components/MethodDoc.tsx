import { useRef } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Code, Info } from "lucide-react";
import APIReference from "./APIReference";
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
  const methodDocRef = useRef<HTMLDivElement>(null);

  const handleValueChange = (value: string) => {
    if (value && methodDocRef.current) {
      setTimeout(() => {
        methodDocRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }, 300);
    }
  };

  return (
    <Accordion
      type="single"
      collapsible
      onValueChange={handleValueChange}
      className="w-full my-2"
    >
      <AccordionItem value="method-details">
        <AccordionTrigger className="px-4">
          <div className="flex items-center space-x-2">
            <Code className="text-green-600 dark:text-green-400" size={20} />
            <span className="font-semibold">{name}</span>
          </div>
        </AccordionTrigger>
        <AccordionContent ref={methodDocRef} className="px-4 pb-4">
          <p className="mb-4 text-gray-600 dark:text-gray-300">{description}</p>

          {parameters.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold border-b pb-2.5 border-gray-200 dark:border-gray-800 dark:text-white">
                Parameters:
              </h4>
              {parameters.map((param, index) => (
                <APIReference key={index} {...param} />
              ))}
            </div>
          )}

          {returns && (
            <div className="mb-4">
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
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export default MethodDoc;
