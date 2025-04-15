"use client";

import { searchIndex } from "@/lib/search-index";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";
import { DialogTitle } from "@/components/ui/dialog";
import { CommandGroup } from "cmdk";
import { Button } from "@/components/ui/button";

export default function Search() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const attributes = searchIndex.flatMap((doc) => {
    const q = query.toLowerCase();

    const matchingAttributes = doc.attributes?.filter((attr) => {
      return (
        attr.name.toLowerCase().includes(q) ||
        attr.type.toLowerCase().includes(q) ||
        attr.description.toLowerCase().includes(q)
      );
    });

    return matchingAttributes
      ? [
          {
            name: `${doc.title} Attributes`,
            items: matchingAttributes,
            slug: doc.slug,
          },
        ]
      : [];
  });

  return (
    <>
      <Button
        variant="outline"
        className={cn(
          "relative h-8 w-full justify-start rounded-[0.5rem] bg-muted/50 text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-56 xl:w-64",
        )}
        onClick={() => setOpen(true)}
      >
        <span className="hidden lg:inline-flex">Search documentation...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <DialogTitle></DialogTitle>
        <CommandInput
          placeholder="Search docs..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {attributes.map((group) => (
            <CommandGroup key={group.slug} heading={group.name}>
              {group.items.map((attr, i) => (
                <CommandItem
                  key={`${group.slug}-${attr.name}-${i}`}
                  onSelect={() => {
                    router.push(group.slug);
                    setOpen(false);
                  }}
                >
                  <div>
                    <div className="font-medium">{attr.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {attr.description}
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
