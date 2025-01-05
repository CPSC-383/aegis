import type { MarkdownHeading } from "astro";
import { cn } from "@/lib/utils";

interface Props {
  headings: MarkdownHeading[];
  className?: string;
}

const paddingMap: Record<number, string> = {
  1: "",
  2: "",
  3: "pl-4",
  4: "pl-8",
};

export default function TableOfContent({ headings, className }: Props) {
  return (
    <div className={cn("font-secondary", className)}>
      <p className="mb-4 text-lg font-semibold text-zinc-300 flex items-center">
        <span className="text-red-500 mr-2">[</span>
        On This Page
        <span className="text-red-500 ml-2">]</span>
      </p>
      <ul className="text-sm space-y-1.5">
        {headings.map((heading) => {
          const cleanText = heading.text.split("(")[0].trim();
          if (cleanText.toLowerCase() === "example") return null;

          return (
            <li
              key={heading.slug}
              className={`text-zinc-600 ${paddingMap[heading.depth] || ""}`}
            >
              <a
                href={`#${heading.slug}`}
                className="hover:text-zinc-400 transition-colors"
              >
                {cleanText}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
