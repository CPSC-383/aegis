import type { ComponentProps, ReactNode } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from 'fumadocs-ui/utils/cn';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from 'fumadocs-ui/components/ui/collapsible';
import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import { ChevronRight, Code2 } from 'lucide-react';
import { highlight } from 'fumadocs-core/highlight';

const badgeVariants = cva(
  'inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full not-prose transition-colors shadow-sm',
  {
    variants: {
      color: {
        func: 'bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-700/30',
        attribute: 'bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-900/30 dark:text-purple-200 dark:border-purple-700/30',
        class: 'bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-700/30',
        primary: 'bg-gray-200 text-gray-800 border border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600',
      },
    },
  },
);

function parseDocstring(docstring: string) {
  const [description, argsSection] = docstring.split('Args:');
  const args = argsSection
    ? argsSection.trim().split('\n').map(line => line.trim()).filter(line => line.length > 0)
    : [];
  return { description: description.trim(), args };
}


export function PyFunction({ docString, children }: {
  docString?: string;
  children?: ReactNode;
}) {
  const doc = typeof docString === 'string' ? parseDocstring(docString) : null;

  return (
    <section className="text-fd-muted-foreground leading-relaxed prose prose-slate dark:prose-invert max-w-none">
      {doc ? (
        <>
          <p className="mb-4">{doc.description}</p>

          {doc.args.length > 0 && (
            <section className="mb-6">
              <h4 className="font-mono font-semibold text-fd-foreground mb-2">Arguments</h4>
              <ul className="list-disc list-inside font-mono text-sm space-y-1">
                {doc.args.map((arg, i) => (
                  <li key={i} className="whitespace-pre-line">{arg}</li>
                ))}
              </ul>
            </section>
          )}
        </>
      ) : (
        <p className="italic text-fd-muted-foreground mb-6">No documentation available.</p>
      )}

      <div>{children}</div>
    </section>
  );
}

export function PyAttribute(props: {
  name: string;
  type?: string;
  value?: string;
  docString?: string;
}) {
  return (
    <section className="text-fd-muted-foreground leading-relaxed prose prose-slate dark:prose-invert max-w-none my-6">
      <header className="flex gap-3 items-center flex-wrap font-mono mb-4">
        <span className={cn(badgeVariants({ color: "attribute" }))}>attribute</span>
        <span className="font-semibold text-lg text-fd-foreground">{props.name}</span>
        {props.type && (
          <InlineCode
            lang="python"
            className="not-prose text-fd-muted-foreground text-sm bg-fd-muted/20 rounded px-2 py-1"
            code={props.type}
          />
        )}
      </header>

      {props.value && (
        <div className="mb-6 bg-fd-muted/10 rounded-md p-3 border-l-2 border-fd-muted/30">
          <InlineCode
            lang="python"
            className="not-prose text-sm font-mono"
            code={`${props.name} = ${props.value}`}
          />
        </div>
      )}

      {props.docString ? (
        <p className="whitespace-pre-line">{props.docString}</p>
      ) : (
        <p className="italic text-fd-muted-foreground mb-6">No description available.</p>
      )}
    </section>
  );
}

export function PyParameter({ name, type, value, children }: {
  name: string;
  type?: string;
  value?: string;
  children?: ReactNode;
}) {
  return (
    <div
      data-parameter=""
      className="group py-4 px-1 border-b border-fd-border/30 last:border-b-0 transition-all hover:bg-fd-muted/5 hover:px-3 hover:mx-[-8px] rounded-md"
    >
      <div className="flex flex-wrap gap-3 items-center">
        <span className={cn(badgeVariants({ color: "primary" }))}>
          param
        </span>
        <span className="font-mono font-semibold text-lg text-fd-foreground">
          {name}
        </span>
        {type && (
          <InlineCode
            lang="python"
            className="ml-auto text-fd-muted-foreground not-prose text-sm bg-fd-muted/20 rounded px-2 py-1"
            code={type}
          />
        )}
      </div>

      {(value || children) && (
        <div className="mt-3 pl-1">
          {value && (
            <div className="mb-3 bg-fd-muted/10 rounded-md p-3 border-l-2 border-gray-300 dark:border-gray-600">
              <InlineCode
                lang="python"
                code={`${name} = ${value}`}
                className="not-prose text-sm font-mono"
              />
            </div>
          )}
          {children && (
            <div className="text-fd-muted-foreground prose-no-margin leading-relaxed">
              {children}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function PySourceCode({ children }: { children: ReactNode }) {
  return (
    <Collapsible className="my-8">
      <CollapsibleTrigger
        className={cn(
          buttonVariants({
            color: "secondary",
            size: "sm",
          }),
          "group w-full justify-between font-mono transition-all hover:bg-fd-muted/20 border border-fd-border/50 hover:border-fd-border"
        )}
      >
        <span className="flex items-center gap-2">
          <Code2 className="w-4 h-4" />
          View Source Code
        </span>
        <ChevronRight
          className="size-4 text-fd-muted-foreground transition-transform group-data-[state=open]:rotate-90"
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="prose-no-margin mt-4">
        <div className="rounded-lg overflow-hidden border border-fd-border/50 bg-fd-muted/10">
          <div className="bg-fd-muted/20 px-4 py-2 border-b border-fd-border/50">
            <span className="text-xs font-medium text-fd-muted-foreground uppercase tracking-wide">
              Source Code
            </span>
          </div>
          <div className="p-4">
            {children}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function PyFunctionReturn({ type, children }: {
  type: string;
  children?: ReactNode;
}) {
  return (
    <div className="mt-4 pt-3 border-t border-fd-border/40">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm font-semibold text-fd-muted-foreground">Returns</span>
        <InlineCode
          lang="python"
          className="text-sm font-mono rounded px-2 py-0.5"
          code={type}
        />
      </div>
      {children && (
        <p className="text-sm text-fd-muted-foreground leading-relaxed m-0">
          {children}
        </p>
      )}
    </div>
  );
}

async function InlineCode({
  lang,
  code,
  ...rest
}: ComponentProps<'span'> & {
  lang: string;
  code: string;
}) {
  return highlight(code, {
    lang,
    components: {
      pre: (props) => (
        <span
          {...props}
          {...rest}
          className={cn(rest.className, props.className)}
        />
      ),
    },
  });
}

export { Tab, Tabs } from 'fumadocs-ui/components/tabs';
