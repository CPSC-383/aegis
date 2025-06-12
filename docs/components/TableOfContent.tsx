"use client";
import { cn } from "@/lib/utils";
import { TableOfContentsItem } from "@/types";
import { useEffect, useState } from "react";
import { getHeadings } from "@/lib/toc";

interface Props {
  content: string;
  className?: string;
}

const paddingMap: Record<number, string> = {
  1: "",
  2: "",
  3: "pl-6",
  4: "pl-8",
};

const handleClick = (e: React.MouseEvent) => {
  e.preventDefault();
  const target = e.currentTarget as HTMLAnchorElement;
  const targetId = target.getAttribute("href")?.substring(1);
  if (!targetId) return;
  const targetElement = document.getElementById(targetId);
  if (targetElement) {
    targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

export default function TableOfContent({ content, className }: Props) {
  const [activeHeading, setActiveHeading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [headings, setHeadings] = useState<TableOfContentsItem[]>([]);

  useEffect(() => {
    const updateTab = () => {
      const activePanel = document.querySelector('[role="tabpanel"][data-state="active"]');
      const id = activePanel?.getAttribute("id");
      const splits = id?.split("-");
      const tabName = splits?.[splits.length - 1] ?? null;
      setActiveTab(tabName);
    };

    const observer = new MutationObserver(updateTab);
    const tabList = document.querySelector('[role="tablist"]');
    if (tabList) {
      observer.observe(tabList, {
        attributes: true,
        subtree: true,
        attributeFilter: ["data-state"],
      });
    }

    updateTab();
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const extracted = getHeadings(content, activeTab);
    setHeadings(extracted);
  }, [content, activeTab]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveHeading(entry.target.id);
          }
        });
      },
      {
        root: null,
        rootMargin: "0px 0px -85% 0px",
        threshold: 0,
      }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.slug);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <div className={cn("hidden lg:block", className)}>
      <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
        <h3 className="text-sm font-mono uppercase tracking-wider font-black">
          On this page
        </h3>
      </div>

      <nav className="p-1">
        {headings.map((heading) => (
          <a
            key={heading.slug}
            href={`#${heading.slug}`}
            onClick={handleClick}
            className={cn(
              "block px-3 py-2 text-xs transition-colors",
              paddingMap[heading.level] || "",
              activeHeading === heading.slug
                ? "bg-zinc-100 dark:bg-zinc-900 text-foreground dark:text-foreground"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="uppercase tracking-wide">
                {heading.text}
              </span>
            </div>
          </a>
        ))}
      </nav>
    </div>
  );
}
