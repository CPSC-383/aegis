"use client";

import { searchIndex } from "@/lib/search-index";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";
import { DialogTitle } from "./ui/dialog";
import { CommandGroup } from "cmdk";

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

  const temp = searchIndex.flatMap((doc) => {
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
    <CommandDialog open={open} onOpenChange={setOpen}>
      <DialogTitle></DialogTitle>
      <CommandInput
        placeholder="Search docs..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {temp.map((group, i) => (
          <CommandGroup key={`${group.name}-${i}`} heading={group.name}>
            {group.items.map((attr) => (
              <CommandItem
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
  );
}
