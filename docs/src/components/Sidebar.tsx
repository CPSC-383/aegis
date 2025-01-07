"use client";

import { Doc } from "content-collections";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface Props {
  groupedContent: Record<string, Doc[]>;
}

export default function Sidebar({ groupedContent }: Props) {
  const pathname = usePathname();
  const capitalizeSection = (section: string) => {
    return section
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Put the getting started sidebar section at the top.
  const sortedSections = Object.keys(groupedContent).sort((a, b) => {
    if (a === "getting-started") return -1;
    if (b === "getting-started") return 1;
    return a.localeCompare(b);
  });

  return (
    <div className="w-64 p-4 overflow-y-auto">
      {sortedSections.map((section) => (
        <div className="mt-4" key={section}>
          <div className="flex justify-between items-center">
            <span className="font-semibold px-2 py-1 mb-1">
              {capitalizeSection(section)}
            </span>
          </div>

          {groupedContent[section] && (
            <div>
              {groupedContent[section].map((doc) => (
                <Link
                  key={doc.slug}
                  href={`/docs/getting-started/${doc.slug}`}
                  passHref
                >
                  <div
                    className={`block py-1 px-2 text-sm
                    ${
                      pathname === `/docs/getting-started/${doc.slug}`
                        ? "font-semibold border-l-2 border-border"
                        : "text-muted-foreground hover:text-foreground"
                    }
                  `}
                  >
                    {doc.title}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
