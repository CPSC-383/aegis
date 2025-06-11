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
    <div className={`w-60 h-full border-r border-zinc-200 dark:border-zinc-800 ${className}`}>
      <div className="overflow-y-auto h-full no-scrollbar">
        <nav>
          {items.map((item, index) => (
            <div key={index} className="border-b border-zinc-200 dark:border-zinc-800">
              {!item.disabled && (
                <div className="p-4 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                  <h4 className="text-xs font-mono uppercase tracking-wider font-black">
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
                          className={`group px-4 py-3 text-sm font-mono border-b border-zinc-100 dark:border-zinc-900 transition-colors cursor-pointer relative ${pathname === subItem.href + "/"
                            ? "bg-zinc-300 dark:bg-zinc-800 text-foreground dark:text-foreground font-bold"
                            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-950 hover:text-black dark:hover:text-white"
                            }`}
                          onClick={onItemClick}
                        >
                          <div className="flex items-center justify-between">
                            <span className="uppercase tracking-wide text-xs">
                              {subItem.title}
                            </span>
                            {pathname === subItem.href + "/" && (
                              <div className="w-2 h-2 bg-zinc-950 dark:bg-zinc-200"></div>
                            )}
                            {pathname !== subItem.href + "/" && (
                              <div className="h-px w-2 bg-zinc-800 origin-right scale-x-100 group-hover:scale-x-150 transition-transform duration-300" />
                            )}
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
