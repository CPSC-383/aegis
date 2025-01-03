import { Badge } from "@/components/ui/badge";
import type { ReactNode } from "react";

interface Props {
  name: string;
  type: string;
  description: string;
  defaultValue?: string | number;
  children?: ReactNode;
}

export default function Attribute({
  name,
  type,
  description,
  defaultValue,
  children,
}: Props) {
  return (
    <div className="">
      <div className="flex items-center space-x-2">
        <h3 className="font-semibold text-white">{name}</h3>
        <Badge variant="secondary" className="font-mono mt-5">
          {type}
        </Badge>
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
