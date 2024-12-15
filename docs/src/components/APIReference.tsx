import { ReactNode, useState } from "react";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
            <Badge variant="secondary">
              {link ? <Link to={link}>{type}</Link> : <div>{type}</div>}
            </Badge>
          )}
          {required && <Badge variant="destructive">required</Badge>}
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
        <Accordion type="single" collapsible>
          <AccordionItem
            value="child-attributes"
            className="border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 border rounded-lg mt-2"
          >
            <AccordionTrigger className="px-4 hover:no-underline">
              Child Attributes
            </AccordionTrigger>
            <AccordionContent className="px-4">{children}</AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
}

export default APIReference;
