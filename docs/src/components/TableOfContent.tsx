import type { MarkdownHeading } from "astro";
import { cn } from "@/lib/utils";

interface Props {
  headings: MarkdownHeading[];
  className?: string;
}

export default function TableOfContent({ headings, className }: Props) {
  return (
    <div className={cn("font-secondary", className)}>
      <p className="mb-4 text-lg font-semibold text-zinc-300">On This Page</p>
      <ul className="text-sm space-y-2.5">
        {headings.map((heading) => (
          <li
            key={heading.slug}
            className={`text-zinc-600 ${heading.depth === 3 ? "pl-4" : ""}`}
          >
            <a
              href={`#${heading.slug}`}
              className="hover:text-zinc-400 transition-colors"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
