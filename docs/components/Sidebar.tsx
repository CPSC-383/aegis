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
    <div
      className={`w-56 p-4 overflow-y-auto no-scrollbar bg-background ${className}`}
    >
      {items.map((item, index) => (
        <div className="mt-4" key={index}>
          <div className="flex justify-between items-center">
            {!item.disabled && (
              <h4 className="font-semibold px-2 py-1 mb-1">{item.title}</h4>
            )}
          </div>
          {item.items?.length && !item.disabled && (
            <div>
              {item.items.map((item, index) =>
                item.href && !item.disabled ? (
                  <Link key={index} href={item.href} passHref>
                    <div
                      className={`block py-1 px-2 text-sm
                        ${
                          pathname === item.href + "/"
                            ? "font-semibold border-l-2 border-border"
                            : "text-muted-foreground hover:text-foreground"
                        }
                      `}
                      onClick={onItemClick}
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
