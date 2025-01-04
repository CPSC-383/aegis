import { Badge } from "@/components/ui/badge";
import type { ReactNode } from "react";

interface Props {
  name: string;
  type: string;
  description: string;
  defaultValue?: string | number;
  required?: boolean;
  children?: ReactNode;
}

export default function Attribute({
  name,
  type,
  description,
  defaultValue,
  required,
  children,
}: Props) {
  return (
    <div className="flex flex-col justify-start">
      <div className="flex items-center space-x-2">
        <h3 className="font-semibold text-white my-0">{name}</h3>
        <Badge variant="secondary" className="font-mono">
          {type}
        </Badge>
        {required && (
          <Badge variant="destructive" className="text-xs">
            required
          </Badge>
        )}
      </div>
      <p className="text-sm text-muted-foreground mt-1.5">{description}</p>
      {defaultValue !== undefined && (
        <p className="text-sm mt-2">
          <span className="font-medium">Default:</span> {defaultValue}
        </p>
      )}
      {children && <div className="ml-4">{children}</div>}
    </div>
  );
}
