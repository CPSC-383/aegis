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
  3: "pl-3",
  4: "pl-6",
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
      <h3 className="mb-3 text-sm font-medium text-zinc-900 dark:text-white">
        On This Page
      </h3>

      <nav className="space-y-1">
        {headings.map((heading) => (
          <a
            key={heading.slug}
            href={`#${heading.slug}`}
            onClick={handleClick}
            className={cn(
              "block py-1 text-sm transition-colors",
              paddingMap[heading.level] || "",
              activeHeading === heading.slug
                ? "text-zinc-700 dark:text-zinc-200 font-medium"
                : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-white"
            )}
          >
            {heading.text}
          </a>
        ))}
      </nav>
    </div>
  );
}
