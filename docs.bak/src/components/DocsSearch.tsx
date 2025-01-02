import { useMemo, useState, useEffect } from "react";
import { useNavigate, RouteObject } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { ChevronUp, Command } from "lucide-react";

const ROUTE_META = {
  intro: {
    title: "API Introduction",
    description: "Overview of the API usage.",
  },
  location: {
    title: "Location Docs",
    description: "Details about location handling.",
  },
  direction: {
    title: "Direction Docs",
    description: "Understanding directions.",
  },
  world: {
    title: "World Docs",
    description: "Documentation for the world class.",
  },
  cell: { title: "Cell Docs", description: "All about cells in the system." },
  "end-turn": {
    title: "End Turn Command",
    description: "Usage of end-turn command.",
  },
  move: { title: "Move Command", description: "Agent movement commands." },
  "save-surv": {
    title: "Save Survivors Command",
    description: "How to save survivors.",
  },
  "agent-controller": {
    title: "Agent Controller",
    description: "Agent interface docs.",
  },
  installation: {
    title: "Installation Guide",
    description: "How to install Aegis.",
  },
  system: {
    title: "System",
    description: "Overview of the system.",
  },
  agents: {
    title: "Agents",
    description: "Details about agents in Aegis.",
  },
  "running-aegis": { title: "Running Aegis", description: "How to run Aegis." },
  client: {
    title: "Client Docs",
    description: "Information about the client.",
  },
};

const flattenRoutes = (
  routes: RouteObject[],
  basePath = "",
): { path: string; title: string; content: string }[] => {
  const flattened = [];
  for (const route of routes) {
    const fullPath = `${basePath}/${route.path}`.replace(/\/+/g, "/");
    if (route.element && route.path && ROUTE_META.hasOwnProperty(route.path)) {
      const meta = ROUTE_META[route.path as keyof typeof ROUTE_META];
      flattened.push({
        path: fullPath,
        title: meta?.title,
        content: meta?.description,
      });
    }
    if (route.children) {
      flattened.push(...flattenRoutes(route.children, fullPath));
    }
  }
  return flattened;
};

interface Props {
  docsRoutes: RouteObject[];
  gettingStartedRoutes: RouteObject[];
}

function DocsSearch({ docsRoutes, gettingStartedRoutes }: Props) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [os, setOs] = useState<"mac" | "windows" | "linux">("windows");
  const navigate = useNavigate();

  const DOCS_CONTENT = useMemo(() => {
    return [
      ...flattenRoutes(docsRoutes),
      ...flattenRoutes(gettingStartedRoutes),
    ];
  }, [docsRoutes, gettingStartedRoutes]);

  const searchResults = useMemo(() => {
    return DOCS_CONTENT.filter(
      (doc) =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.content.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm, DOCS_CONTENT]);

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes("mac")) {
      setOs("mac");
    } else if (userAgent.includes("windows") || userAgent.includes("win")) {
      setOs("windows");
    } else {
      setOs("linux");
    }

    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <div>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        className="text-gray-600 dark:text-gray-300 bg-light-main-background dark:bg-dark-main-background"
      >
        <span className="mr-2">Search...</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-gray-200 dark:border-gray-800 px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <div className="flex items-center text-xs">
            {os === "mac" ? (
              <Command className="w-3 h-3" />
            ) : (
              <ChevronUp className="w-3 h-3" />
            )}
            K
          </div>
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search documentation..."
          value={searchTerm}
          onValueChange={setSearchTerm}
        />
        <CommandList className="no-scrollbar">
          {searchResults.length > 0 ? (
            <CommandGroup heading="Documentation Results">
              {searchResults.map((result) => (
                <CommandItem
                  key={result.path}
                  onSelect={() => {
                    navigate(result.path);
                    setOpen(false);
                  }}
                >
                  <div>
                    <div className="font-medium">{result.title}</div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {result.content}
                    </p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          ) : (
            <CommandEmpty>No results found.</CommandEmpty>
          )}
        </CommandList>
      </CommandDialog>
    </div>
  );
}

export default DocsSearch;
