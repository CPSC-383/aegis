"use client";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAssignment } from "@/contexts/AssignmentContext";
import { navPathfinding } from "@/config/nav-pathfinding";
import { navMas } from "@/config/nav-mas";
import { SidebarNavItem } from "@/types";
import Search from "@/components/Search";
import { useTheme } from "next-themes";
import Image from "next/image";
import { getImagePath } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";

interface Props {
  sidebarItems?: SidebarNavItem[];
}

export default function MobileNavigation({ sidebarItems }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { assignment, isPathfinding } = useAssignment()
  const navConfig = isPathfinding ? navPathfinding : navMas

  const logoPath = theme === "dark" ? "/logo-white.png" : "/logo-black.png";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      <nav className="lg:hidden w-full flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="flex items-center">
          {mounted && (
            <Image
              src={getImagePath(logoPath)}
              alt="Logo"
              width={60}
              height={60}
            />
          )}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeMenu}
        />
      )}

      <div
        className={`fixed flex flex-col left-0 top-0 z-50 h-full w-80 max-w-[85vw] bg-white dark:bg-slate-900 shadow-xl transform transition-transform duration-300 ease-out lg:hidden ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="font-medium text-slate-900 dark:text-white">Menu</h2>
          <button
            onClick={closeMenu}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <Search source="mobile" />
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="p-4">
            <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
              Navigation
            </h3>
            <nav className="space-y-1">
              {navConfig.mainNav.map((item, index) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(`/${assignment}${item.path}/`) || pathname.startsWith(`${item.path}/`);
                return (
                  <Link
                    key={index}
                    href={item.href}
                    onClick={closeMenu}
                    className={`block px-2 py-2 text-sm rounded-lg transition-colors ${isActive
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                      }`}
                  >
                    {item.title}
                  </Link>
                );
              })}
            </nav>
          </div>

          {sidebarItems && (
            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
              <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                Documentation
              </h3>
              <div className="space-y-4">
                {sidebarItems.map((item, index) => (
                  <div key={index}>
                    {!item.disabled && (
                      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        {item.title}
                      </h4>
                    )}
                    {item.items?.length && !item.disabled && (
                      <div className="space-y-1 ml-2">
                        {item.items.map((subItem, subIndex) =>
                          subItem.href && !subItem.disabled ? (
                            <Link
                              key={subIndex}
                              href={subItem.href}
                              onClick={closeMenu}
                              className={`block px-2 py-1.5 text-sm rounded-md transition-colors ${pathname === subItem.href + "/"
                                ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                                : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                                }`}
                            >
                              {subItem.title}
                            </Link>
                          ) : null
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
