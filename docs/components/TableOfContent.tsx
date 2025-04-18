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
  3: "pl-4",
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
      const activePanel = document.querySelector(
        '[role="tabpanel"][data-state="active"]',
      );
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
    const observerOptions: IntersectionObserverInit = {
      root: null,
      rootMargin: "0px 0px -85% 0px",
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const id = entry.target.id;
        if (entry.isIntersecting) {
          setActiveHeading(id);
        }
      });
    }, observerOptions);

    const observeHeadings = (heading: TableOfContentsItem) => {
      const element = document.getElementById(heading.slug);
      if (element) {
        observer.observe(element);
      }
    };

    headings.forEach(observeHeadings);

    return () => {
      observer.disconnect();
    };
  }, [headings]);

  return (
    <div className={cn("font-secondary xl:block hidden", className)}>
      <p className="mb-4 text-lg font-semibold flex items-center">
        On This Page
      </p>
      <ul className="text-sm space-y-1.5">
        {headings.map((heading) => {
          return (
            <li
              key={heading.slug}
              className={`text-muted-foreground ${paddingMap[heading.level] || ""}`}
            >
              <a
                href={`#${heading.slug}`}
                onClick={handleClick}
                className={cn(
                  "hover:text-foreground transition-colors",
                  activeHeading === heading.slug
                    ? "font-semibold text-foreground"
                    : "",
                )}
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
