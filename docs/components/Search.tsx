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

  const results = query
    ? searchIndex.filter((doc) => {
        const q = query.toLowerCase();
        return (
          doc.title.toLowerCase().includes(q) ||
          doc.description.toLowerCase().includes(q) ||
          doc.content.toLowerCase().includes(q)
        );
      })
    : searchIndex;

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
        {results.map((doc) => (
          <CommandItem
            key={doc.slug}
            value={`${doc.title} ${doc.content}`}
            onSelect={() => {
              router.push(doc.slug);
              setOpen(false);
            }}
          >
            <div>
              <div className="font-medium">{doc.title}</div>
              <div className="text-sm text-muted-foreground">
                {doc.description}
              </div>
            </div>
          </CommandItem>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
