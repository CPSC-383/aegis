"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { SidebarNavItem } from "@/types";

interface Props {
  items: SidebarNavItem[];
}

export default function Sidebar({ items }: Props) {
  const pathname = usePathname();

  return (
    <div className="w-64 p-4 overflow-y-auto">
      {items.map((item, index) => (
        <div className="mt-4" key={index}>
          <div className="flex justify-between items-center">
            <h4 className="font-semibold px-2 py-1 mb-1">{item.title}</h4>
          </div>
          {item.items?.length && (
            <div>
              {item.items.map((item, index) =>
                item.href && !item.disabled ? (
                  <Link key={index} href={item.href} passHref>
                    <div
                      className={`block py-1 px-2 text-sm
                  ${
                    pathname === item.href
                      ? "font-semibold border-l-2 border-border"
                      : "text-muted-foreground hover:text-foreground"
                  }
                `}
                    >
                      {item.title}
                    </div>
                  </Link>
                ) : null,
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
