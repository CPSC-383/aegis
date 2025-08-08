import * as TabsComponents from './components/tabs';
import * as TreeComponents from './components/file-tree'
import { ImageZoom } from 'fumadocs-ui/components/image-zoom';
import type { MDXComponents } from 'mdx/types';
import { Callout } from './components/callout';
import { CodeBlock, CodeBlockTab, CodeBlockTabs, CodeBlockTabsList, CodeBlockTabsTrigger } from './components/codeblock';
import { cn } from './lib/cn';

// use this function to get MDX components, you will need it for rendering MDX
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...TabsComponents,
    ...TreeComponents,
    ...components,
    Callout,
    CodeBlockTab,
    CodeBlockTabs,
    CodeBlockTabsList,
    CodeBlockTabsTrigger,
    Step: ({ className, ...props }) => (
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
        className="relative [&>h3]:step steps mb-12 ml-4 border-l border-solid border-cyan-600/40 dark:border-cyan-400/30 pl-8 [counter-reset:step]"
        {...props}
      />
    ),
    img: (props) => <ImageZoom {...(props as any)} />,
    h2: ({ children, ...props }) => (
      <h2
        className="flex items-center gap-2 text-xl font-semibold text-cyan-300 font-mono uppercase tracking-wide border-b border-cyan-500/20 pb-2 mb-4 mt-8"
        {...props}
      >
        <div className="w-1 h-6 bg-cyan-500 rounded-full" />
        {children}
      </h2>
    ),

    h3: ({ children, ...props }) => (
      <h3
        className="flex items-center gap-2 text-lg font-semibold text-cyan-300 font-mono uppercase tracking-wide border-b border-cyan-500/10 pb-1 mb-3 mt-6"
        {...props}
      >
        <div className="w-1 h-5 bg-cyan-400 rounded-full" />
        {children}
      </h3>
    ),

    h4: ({ children, ...props }) => (
      <h4
        className="flex items-center gap-2 text-base font-semibold text-cyan-300 font-mono uppercase tracking-wide border-b border-cyan-500/10 pb-1 mb-2 mt-5"
        {...props}
      >
        <div className="w-1 h-4 bg-cyan-400 rounded-full" />
        {children}
      </h4>
    ),

    h5: ({ children, ...props }) => (
      <h5
        className="flex items-center gap-2 text-sm font-semibold text-cyan-300 font-mono uppercase tracking-wide border-b border-cyan-500/20 pb-1 mb-2 mt-4"
        {...props}
      >
        <div className="w-1 h-3 bg-cyan-500 rounded-full" />
        {children}
      </h5>
    ),

    h6: ({ children, ...props }) => (
      <h6
        className="flex items-center gap-2 text-xs font-semibold text-cyan-300 font-mono uppercase tracking-wide border-b border-cyan-500/20 pb-1 mb-2 mt-3"
        {...props}
      >
        <div className="w-1 h-2 bg-cyan-500 rounded-full" />
        {children}
      </h6>
    ),
    p: ({ className, ...props }) => (
      <p className={cn("leading-7 not-first:mt-6", className)} {...props} />
    ),
    ul: ({ className, ...props }) => (
      <ul className={cn("ml-6 list-disc", className)} {...props} />
    ),
    ol: ({ className, ...props }) => (
      <ol className={cn("ml-6 list-decimal", className)} {...props} />
    ),
    li: ({ className, ...props }) => (
      <li className={cn("mt-2", className)} {...props} />
    ),
    a: ({ className, ...props }) => (
      <a
        className={cn(
          'relative inline-block font-medium text-cyan-400 transition-all duration-500 ease-out',
          'focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:ring-offset-2 focus:ring-offset-slate-900',
          'no-underline cursor-pointer',
          'after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[2px]',
          'after:bg-gradient-to-r after:from-cyan-500 after:via-cyan-400 after:to-cyan-300',
          'after:rounded-full after:transition-all after:duration-500 after:ease-out',
          'after:shadow-[0_0_4px_rgb(34,211,238)]',
          'hover:after:w-full hover:after:shadow-[0_0_8px_rgb(34,211,238)]',
          className
        )}
        {...props}
      />
    ),
    blockquote: ({ children, ...props }) => (
      <blockquote className="border-l-4 border-cyan-500 bg-cyan-900/10 pl-4 py-2 my-4 text-cyan-200 italic" {...props}>
        {children}
      </blockquote>
    ),
    pre: CodeBlock,
    code: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
      <code
        className={cn(
          "relative bg-muted px-1.5 py-0.5 font-mono text-sm text-cyan-300",
          "break-all whitespace-pre max-w-full overflow-auto",
          "[&:not(pre_&)]:font-semibold",
          className,
        )}
        {...props}
      />
    ),
  };
}
