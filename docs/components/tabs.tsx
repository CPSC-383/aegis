'use client';

import * as React from 'react';
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
} from 'react';
import { cn } from '../lib/cn';
import * as Unstyled from './tabs.unstyled';

const TabsContext = createContext<{
  items?: string[];
  collection: (string | symbol)[];
} | null>(null);

function useTabContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('You must wrap your component in <Tabs>');
  return ctx;
}

export const TabsList = React.forwardRef<
  React.ComponentRef<typeof Unstyled.TabsList>,
  React.ComponentPropsWithoutRef<typeof Unstyled.TabsList>
>((props, ref) => {
  return (
    <div className="bg-slate-800/80 backdrop-blur-sm border-b border-cyan-500/30 px-4 py-2">
      <Unstyled.TabsList
        ref={ref}
        {...props}
        className={cn(
          'flex flex-row overflow-x-auto px-0 -mx-0 text-slate-400',
          props.className,
        )}
      />
    </div>
  );
});
TabsList.displayName = 'TabsList';

export const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof Unstyled.TabsTrigger>,
  React.ComponentPropsWithoutRef<typeof Unstyled.TabsTrigger>
>((props, ref) => (
  <Unstyled.TabsTrigger
    ref={ref}
    {...props}
    className={cn(
      'relative group inline-flex text-sm font-mono text-nowrap items-center gap-2 px-3 py-2',
      'text-slate-400 hover:text-cyan-300 data-[state=active]:text-cyan-300',
      'rounded-md transition-colors',
      '[&_svg]:size-4',
      props.className,
    )}
  >
    <div className="absolute inset-x-1 bottom-0 h-0.5 group-data-[state=active]:bg-cyan-400 rounded-full" />
    {props.children}
  </Unstyled.TabsTrigger>
));
TabsTrigger.displayName = 'TabsTrigger';

export function Tabs({
  ref,
  className,
  items,
  label,
  defaultIndex = 0,
  defaultValue = items ? escapeValue(items[defaultIndex]) : undefined,
  ...props
}: TabsProps) {
  const [value, setValue] = useState(defaultValue);
  const collection = useMemo<(string | symbol)[]>(() => [], []);

  return (
    <Unstyled.Tabs
      ref={ref}
      className={cn(
        'bg-slate-900/70 backdrop-blur-sm border border-cyan-500/30 rounded-xl overflow-hidden shadow-lg shadow-cyan-500/10',
        'flex flex-col overflow-hidden mt-4',
        !items && 'my-6',
        className,
      )}
      value={value}
      onValueChange={(v: string) => {
        if (items && !items.some((item) => escapeValue(item) === v)) return;
        setValue(v);
      }}
      {...props}
    >
      {items && (
        <TabsList>
          {label && (
            <span className="text-sm font-medium my-auto me-auto">{label}</span>
          )}
          {items.map((item) => (
            <TabsTrigger key={item} value={escapeValue(item)}>
              {item}
            </TabsTrigger>
          ))}
        </TabsList>
      )}
      <TabsContext.Provider
        value={useMemo(() => ({ items, collection }), [collection, items])}
      >
        {props.children}
      </TabsContext.Provider>
    </Unstyled.Tabs>
  );
}

export function TabsContent({
  value,
  className,
  ...props
}: ComponentProps<typeof Unstyled.TabsContent>) {
  return (
    <Unstyled.TabsContent
      value={value}
      forceMount
      className={cn(
        'py-4 px-4 overflow-auto max-h-[600px] fd-scroll-container',
        'scrollbar-thin scrollbar-track-slate-800/50 scrollbar-thumb-cyan-500/30',
        'bg-slate-900/80 rounded-b-xl border-t border-cyan-500/20',
        'prose-no-margin data-[state=inactive]:hidden [&>figure:only-child]:-m-4 [&>figure:only-child]:border-none',
        className,
      )}
      {...props}
    >
      {props.children}
    </Unstyled.TabsContent>
  );
}

export function Tab({ value, ...props }: TabProps) {
  const { items } = useTabContext();
  const resolved =
    value ??
    // eslint-disable-next-line react-hooks/rules-of-hooks -- `value` is not supposed to change
    items?.at(useCollectionIndex());
  if (!resolved)
    throw new Error(
      'Failed to resolve tab `value`, please pass a `value` prop to the Tab component.',
    );

  return (
    <TabsContent value={escapeValue(resolved)} {...props}>
      {props.children}
    </TabsContent>
  );
}

function useCollectionIndex() {
  const key = useId();
  const { collection } = useTabContext();

  useEffect(() => {
    return () => {
      const idx = collection.indexOf(key);
      if (idx !== -1) collection.splice(idx, 1);
    };
  }, [key, collection]);

  if (!collection.includes(key)) collection.push(key);
  return collection.indexOf(key);
}

function escapeValue(v: string): string {
  return v.toLowerCase().replace(/\s/, '-');
}

export interface TabsProps extends Omit<ComponentProps<typeof Unstyled.Tabs>, 'value' | 'onValueChange'> {
  items?: string[];
  defaultIndex?: number;
  label?: ReactNode;
}

export interface TabProps extends Omit<ComponentProps<typeof Unstyled.TabsContent>, 'value'> {
  value?: string;
}
