"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";
import { navConfig } from "@/config/nav";
import ThemeToggle from "@/components/ThemeToggle";

export default function Navbar() {
  const pathname = usePathname();
  const { theme } = useTheme();

  return (
    <nav className="w-full flex items-center justify-between px-6 py-4">
      <div className="flex items-center space-x-2">
        <img
          src={theme === "dark" ? "/logo-white.png" : "/logo-black.png"}
          className="h-5"
        />
      </div>

      <div className="hidden md:flex space-x-6 text-sm">
        {navConfig.mainNav.map((item, index) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={index}
              href={item.href}
              className={`hover:text-foreground ${isActive ? "font-semibold border-b-2 border-border pb-2" : "text-muted-foreground"}`}
            >
              <span>{item.title}</span>
            </Link>
          );
        })}
      </div>
      <ThemeToggle />
    </nav>
  );
}
