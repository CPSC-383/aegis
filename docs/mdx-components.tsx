import { useMDXComponent } from "@content-collections/mdx/react";
import { cn, getImagePath } from "@/lib/utils";

import Admonition from "@/components/Admonition";
import Attribute from "@/components/Attribute";
import Image from "next/image";
import Link from "next/link";
import Method from "@/components/Method";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tree, TreeItem } from "@/components/ui/file-tree";
import { ExternalLink } from "lucide-react";

const components = {
  Admonition,
  Attribute,
  Badge,
  Method,
  Tree,
  TreeItem,
  h1: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      className={cn("mt-2 scroll-m-20 text-4xl font-bold", className)}
      {...props}
    />
  ),
  h2: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className={cn(
        "mt-12 scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight first:mt-0",
        className,
      )}
      {...props}
    />
  ),
  h3: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className={cn(
        "mt-8 scroll-m-20 text-xl font-semibold tracking-tight",
        className,
      )}
      {...props}
    />
  ),
  h4: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4
      className={cn(
        "font-heading mt-8 scroll-m-20 text-lg font-semibold tracking-tight",
        className,
      )}
      {...props}
    />
  ),
  h5: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h5
      className={cn(
        "mt-8 scroll-m-20 text-lg font-semibold tracking-tight",
        className,
      )}
      {...props}
    />
  ),
  h6: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h6
      className={cn(
        "mt-8 scroll-m-20 text-base font-semibold tracking-tight",
        className,
      )}
      {...props}
    />
  ),
  a: ({ className, ...props }: React.ComponentProps<typeof Link>) => (
    <Link
      className={cn(
        "border-b border-zinc-300 dark:border-zinc-700 hover:border-zinc-700 dark:hover:border-zinc-300 inline-flex items-center gap-1",
        className,
      )}
      target="_blank"
      {...props}
    >
      {props.children}
      <ExternalLink className="w-3 h-3 inline" />
    </Link>
  ),
  p: ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className={cn("leading-7 not-first:mt-6", className)} {...props} />
  ),
  ul: ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className={cn("ml-6 list-disc", className)} {...props} />
  ),
  ol: ({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className={cn("ml-6 list-decimal", className)} {...props} />
  ),
  li: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <li className={cn("mt-2", className)} {...props} />
  ),
  pre: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <div className="border border-zinc-300 dark:border-zinc-700 p-4 bg-zinc-50 dark:bg-zinc-950 mt-4">
      <div className="flex items-center justify-between border-b border-zinc-300 dark:border-zinc-700 pb-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-400 rounded-full" />
          <div className="w-2 h-2 bg-yellow-400 rounded-full" />
          <div className="w-2 h-2 bg-green-400 rounded-full" />
        </div>
        <div className="text-sm text-muted-foreground">CODE</div>
      </div>
      <pre
        className={cn(
          "mb-4 mt-6 max-h-[650px] overflow-x-auto border border-zinc-300 dark:border-zinc-700 py-4 dark:bg-zinc-900 bg-zinc-100",
          className,
        )}
        {...props}
      />
    </div>
  ),
  code: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <code
      className={cn(
        "relative bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground",
        "break-all whitespace-pre-wrap max-w-full overflow-auto",
        "[&:not(pre_&)]:font-semibold",
        className,
      )}
      {...props}
    />
  ),
  Image: ({ className, src, ...props }: React.ComponentProps<typeof Image>) => (
    <Image className={className} src={getImagePath(src as string)} {...props} />
  ),
  Tabs: ({ className, ...props }: React.ComponentProps<typeof Tabs>) => (
    <Tabs className={cn("relative mt-6 w-full", className)} {...props} />
  ),
  TabsList: ({
    className,
    ...props
  }: React.ComponentProps<typeof TabsList>) => (
    <TabsList
      className={cn(
        "w-full justify-start rounded-none border-b bg-transparent p-0",
        className,
      )}
      {...props}
    />
  ),
  TabsTrigger: ({
    className,
    ...props
  }: React.ComponentProps<typeof TabsTrigger>) => (
    <TabsTrigger
      className={cn(
        "relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none",
        className,
      )}
      {...props}
    />
  ),
  TabsContent: ({
    className,
    ...props
  }: React.ComponentProps<typeof TabsContent>) => (
    <TabsContent
      className={cn(
        "relative [&_h3.font-heading]:text-base [&_h3.font-heading]:font-semibold",
        className,
      )}
      {...props}
    />
  ),
  Step: ({ className, ...props }: React.ComponentProps<"h3">) => (
    <h3
      className={cn(
        "mt-8 scroll-m-20 text-xl font-semibold tracking-tight",
        className,
      )}
      {...props}
    />
  ),
  Steps: ({ ...props }) => (
    <div
      className="relative [&>h3]:step steps mb-12 ml-4 border-l border-dashed pl-8 [counter-reset:step]"
      {...props}
    />
  ),
};

interface MDXProps {
  code: string;
  className?: string;
}

export function Mdx({ code, className }: MDXProps) {
  const Component = useMDXComponent(code);

  return (
    <article className={cn("mx-auto max-w-[120ch]", className)}>
      <Component components={components} />
    </article>
  );
}
