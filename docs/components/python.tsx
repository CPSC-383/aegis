import { type ComponentProps, type ReactNode } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from 'fumadocs-ui/utils/cn';
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
  const sections = {
    description: '',
    parameters: [] as string[],
    returns: '',
    throws: '',
  };

  const lines = docstring.split('\n').map(line => line.trim());

  let currentSection: keyof typeof sections = 'description';
  for (const line of lines) {
    if (/^(Arguments?|Args?):$/i.test(line)) {
      currentSection = 'parameters';
      continue;
    }
    if (/^Returns?:$/i.test(line)) {
      currentSection = 'returns';
      continue;
    }
    if (/^Throws?:$/i.test(line)) {
      currentSection = 'throws';
      continue;
    }

    if (currentSection === 'parameters') {
      if (line) sections.parameters.push(line);
    } else if (currentSection === 'description') {
      if (sections.description) {
        sections.description += ' ' + line;
      } else {
        sections.description = line;
      }
    } else if (currentSection === 'returns') {
      if (sections.returns) {
        sections.returns += ' ' + line;
      } else {
        sections.returns = line;
      }
    } else if (currentSection === 'throws') {
      if (sections.throws) {
        sections.throws += ' ' + line;
      } else {
        sections.throws = line;
      }
    }
  }

  return sections;
}


export function PyFunction({ docString, children }: { docString?: string; children?: ReactNode }) {
  const doc = typeof docString === 'string' ? parseDocstring(docString) : null;

  return (
    <section className="text-fd-muted-foreground leading-relaxed prose prose-slate dark:prose-invert max-w-none">
      {doc ? (
        <>
          <p className="mb-4">{doc.description}</p>

          {doc.parameters.length > 0 && (
            <section className="mb-6">
              <h4 className="font-mono font-semibold text-fd-foreground mb-2">Parameters</h4>
              <ul className="list-disc list-inside font-mono text-sm space-y-1">
                {doc.parameters.map((param, i) => (
                  <li key={i} className="whitespace-pre-line">{param}</li>
                ))}
              </ul>
            </section>
          )}

          {doc.returns && (
            <section className="mb-6">
              <h4 className="font-mono font-semibold text-fd-foreground mb-2">Returns</h4>
              <p className="font-mono text-sm whitespace-pre-line">{doc.returns}</p>
            </section>
          )}

          {doc.throws && (
            <section className="mb-6">
              <h4 className="font-mono font-semibold text-fd-foreground mb-2">Throws</h4>
              <p className="font-mono text-sm whitespace-pre-line">{doc.throws}</p>
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

export function PyFunctionSignature({
  returnType,
  name,
  parameters = [],
  throws,
  className,
}: {
  returnType?: string;
  name: string;
  parameters?: string[];
  throws?: string;
  className?: string;
}) {
  const paramsStr = parameters.join(', ');
  const throwsStr = throws ? ` throws ${throws}` : '';
  const signature = `${returnType ?? ''} ${name}(${paramsStr})${throwsStr}`.trim();

  return (
    <InlineCode lang="python" code={signature} className={className} />
  );
}

export function PyAttribute(props: {
  type?: string;
  value?: string;
  docString?: string;
}) {
  return (
    <section className="text-fd-muted-foreground leading-relaxed prose prose-slate dark:prose-invert max-w-none my-6">
      {(props.type || props.value !== undefined) && (
        <InlineCode
          lang="python"
          className="not-prose text-sm font-mono mb-4 block"
          code={`${props.type ?? ""}${props.value !== undefined ? ` = ${props.value}` : ""}`}
        />
      )}

      {props.docString ? (
        <p className="whitespace-pre-line">{props.docString}</p>
      ) : (
        <p className="italic text-fd-muted-foreground">No description available.</p>
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
          className={cn(rest.className, props.className, "[--padding-left:0!important]")}
        />
      ),
    },
  });
}

export { Tab, Tabs } from 'fumadocs-ui/components/tabs';
