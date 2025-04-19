"use client";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navConfig } from "@/config/nav";
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
  const logoPath = theme === "dark" ? "/logo-white.png" : "/logo-black.png";

  // Fix logo hydration issue
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close menu when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  return (
    <>
      <nav className="lg-custom:hidden w-full flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-2">
          {mounted ? (
            <Image
              src={getImagePath(logoPath)}
              alt="Picture of Aegis Logo"
              width={60}
              height={60}
            />
          ) : (
            <div className="h-5 w-5" />
          )}
        </div>
        <div className="flex items-center space-x-3">
          <ThemeToggle />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg-custom:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed left-0 top-0 z-50 h-full w-80 max-w-[80vw] transform bg-background shadow-lg transition-transform duration-400 ease-in-out lg-custom:hidden flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b shrink-0">
          <span className="font-medium">Menu</span>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b shrink-0">
          <Search />
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="p-4 border-b">
            <h3 className="text-sm font-semibold mb-3">Navigation</h3>
            <div className="space-y-1">
              {navConfig.mainNav.map((item, index) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(`${item.path}/`);
                return (
                  <Link
                    key={index}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`block py-1.5 text-sm ${
                      isActive
                        ? "font-semibold text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {item.title}
                  </Link>
                );
              })}
            </div>
          </div>

          {sidebarItems && (
            <div className="p-4 pb-20">
              <h3 className="text-sm font-semibold mb-3">Documentation</h3>
              {sidebarItems.map((item, index) => (
                <div className="mt-4" key={index}>
                  {!item.disabled && (
                    <h4 className="font-medium text-sm mb-2">{item.title}</h4>
                  )}
                  {item.items?.length && !item.disabled && (
                    <div className="ml-2 space-y-1">
                      {item.items.map((subItem, subIndex) =>
                        subItem.href && !subItem.disabled ? (
                          <Link key={subIndex} href={subItem.href} passHref>
                            <div
                              className={`block py-1.5 text-sm
                              ${
                                pathname === subItem.href + "/"
                                  ? "font-semibold text-foreground"
                                  : "text-muted-foreground"
                              }
                            `}
                              onClick={() => setIsOpen(false)}
                            >
                              {subItem.title}
                            </div>
                          </Link>
                        ) : null,
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
