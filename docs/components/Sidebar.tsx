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
    <div className={`w-50 h-full border-r border-zinc-200 dark:border-zinc-800 ${className}`}>
      <div className="overflow-y-auto h-full no-scrollbar">
        <nav>
          {items.map((item, index) => (
            <div key={index}>
              {!item.disabled && (
                <div className="p-4">
                  <h4 className="text-sm font-mono uppercase tracking-wider font-black">
                    {item.title}
                  </h4>
                </div>
              )}
              {item.items?.length && !item.disabled && (
                <div>
                  {item.items.map((subItem, subIndex) =>
                    subItem.href && !subItem.disabled ? (
                      <Link key={subIndex} href={subItem.href}>
                        <div
                          className={`group px-4 py-3 text-sm transition-colors cursor-pointer relative ${pathname === subItem.href + "/"
                            ? "bg-zinc-100 dark:bg-zinc-900 text-foreground dark:text-foreground font-medium"
                            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white"
                            }`}
                          onClick={onItemClick}
                        >
                          <div className="flex items-center">
                            <span className="uppercase tracking-wide text-xs">
                              {subItem.title}
                            </span>
                          </div>
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
    </div>
  );
}
