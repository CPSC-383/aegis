"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { SidebarNavItem } from "@/types";

interface Props {
  items: SidebarNavItem[];
  className?: string;
  onItemClick?: () => void;
}

export default function Sidebar({ items, className = "", onItemClick }: Props) {
  const pathname = usePathname();

  return (
    <div className={`w-60 p-4 overflow-y-auto h-full no-scrollbar ${className}`}>
      <nav className="space-y-6">
        {items.map((item, index) => (
          <div key={index}>
            {!item.disabled && (
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-400 uppercase tracking-wide mb-2 px-2">
                {item.title}
              </h4>
            )}

            {item.items?.length && !item.disabled && (
              <div className="space-y-1">
                {item.items.map((subItem, subIndex) =>
                  subItem.href && !subItem.disabled ? (
                    <Link key={subIndex} href={subItem.href}>
                      <div
                        className={`px-2 py-2 text-sm rounded-md transition-colors cursor-pointer ${pathname === subItem.href + "/"
                          ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                          }`}
                        onClick={onItemClick}
                      >
                        {subItem.title}
                      </div>
                    </Link>
                  ) : null
                )}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}
