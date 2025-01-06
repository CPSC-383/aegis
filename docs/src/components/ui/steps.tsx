import React from "react";
import { cn } from "@/lib/utils";

const Step = ({ className, ...props }: React.ComponentProps<"h3">) => (
  <h3
    className={cn(
      "font-heading mt-8 scroll-m-20 text-xl font-semibold tracking-tight",
      className,
    )}
    {...props}
  />
);

const Steps = ({ ...props }: React.ComponentProps<"div">) => (
  <div
    className="relative [&>h3]:step steps mb-12 ml-4 border-l pl-8 text-zinc-400 [counter-reset:step]"
    {...props}
  />
);

export { Step, Steps };
