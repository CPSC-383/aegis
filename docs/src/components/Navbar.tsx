"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";
import ThemeToggle from "@/components/ThemeToggle";

export default function Navbar() {
  const pathname = usePathname();
  const { theme } = useTheme();

  const menuItems = [
    { to: "/", label: "Home" },
    { to: "/getting-started", label: "Getting Started" },
    { to: "/docs", label: "API Reference" },
    { to: "/common-errors", label: "Common Errors" },
  ];

  return (
    <nav className="w-full flex items-center justify-between px-6 py-4">
      <div className="flex items-center space-x-2">
        <img
          src={theme === "dark" ? "/logo-white.png" : "/logo-black.png"}
          className="h-5"
        />
      </div>

      <div className="hidden md:flex space-x-6 text-sm">
        {menuItems.map(({ to, label }) => {
          const isActive = pathname === to || pathname.startsWith(`${to}/`);

          return (
            <Link
              key={to}
              href={to}
              className={`hover:text-foreground ${isActive ? "font-semibold border-b-2 border-border pb-2" : "text-muted-foreground"}`}
            >
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
      <ThemeToggle />
    </nav>
  );
}
