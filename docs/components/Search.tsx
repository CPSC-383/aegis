"use client";

import { searchIndex } from "@/lib/search-index";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
  CommandGroup,
} from "@/components/ui/command";
import { DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Cog, Tag } from "lucide-react";
import { useSearch } from "@/contexts/SearchContext";

interface SearchProps {
  source: "navbar" | "mobile";
}

export default function Search({ source }: SearchProps) {
  const {
    isSearchOpen,
    openSearch,
    closeSearch,
    searchSource,
    setSearchSource,
  } = useSearch();
  const [query, setQuery] = useState("");
  const router = useRouter();

  const isActive = !searchSource || searchSource === source;

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();

        if (!isSearchOpen) {
          setSearchSource(source);
          openSearch();
        } else if (searchSource === source) {
          closeSearch();
          setSearchSource(null);
        }
      }
    };

    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, [
    isSearchOpen,
    openSearch,
    closeSearch,
    source,
    searchSource,
    setSearchSource,
  ]);

  useEffect(() => {
    if (isSearchOpen) {
      setQuery("");
    }
  }, [isSearchOpen]);

  const results = useMemo(() => {
    const q = query.toLowerCase();
    return searchIndex.flatMap((doc) => {
      const matchingAttributes =
        doc.attributes?.filter(
          (attr) =>
            attr.name.toLowerCase().includes(q) ||
            attr.type.toLowerCase().includes(q) ||
            attr.description.toLowerCase().includes(q),
        ) ?? [];
      const matchingMethods =
        doc.methods?.filter(
          (method) =>
            method.name.toLowerCase().includes(q) ||
            method.description.toLowerCase().includes(q),
        ) ?? [];
      const items = [
        ...matchingAttributes.map((attr) => ({
          type: "attribute" as const,
          name: attr.name,
          description: attr.description,
        })),
        ...matchingMethods.map((method) => ({
          type: "method" as const,
          name: method.name,
          description: method.description,
        })),
      ];
      return items.length > 0
        ? [
            {
              name: doc.title,
              items,
              slug: doc.slug,
            },
          ]
        : [];
    });
  }, [query]);

  // If this instance is not active, don't render the button
  if (!isActive) return null;

  return (
    <>
      <Button
        variant="outline"
        className={cn(
          "relative h-8 w-full justify-start rounded-[0.5rem] bg-muted/50 text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-32 lg:w-42",
        )}
        onClick={() => {
          setSearchSource(source);
          openSearch();
        }}
      >
        <span className="hidden lg:inline-flex">Search api...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog
        open={isSearchOpen && searchSource === source}
        onOpenChange={(open) => {
          if (!open) {
            closeSearch();
            setSearchSource(null);
          }
        }}
      >
        <DialogTitle></DialogTitle>
        <CommandInput
          placeholder="Search docs..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {results.map((group) => (
            <CommandGroup key={group.slug} heading={group.name}>
              {group.items.map((item, i) => (
                <CommandItem
                  key={`${group.slug}-${item.type}-${item.name}-${i}`}
                  value={`${item.name} ${item.description}`}
                  onSelect={() => {
                    router.push(group.slug);
                    closeSearch();
                    setSearchSource(null);
                  }}
                >
                  <div className="flex items-start justify-center gap-2">
                    {item.type === "attribute" ? (
                      <Tag className="mt-1 h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Cog className="mt-1 h-4 w-4 text-muted-foreground" />
                    )}
                    <div>
                      <div className="font-medium">
                        {item.name}
                        <span className="ml-2 text-xs text-muted-foreground uppercase">
                          ({item.type})
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {item.description}
                      </div>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
