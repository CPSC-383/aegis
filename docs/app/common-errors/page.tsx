"use client";

import { ArrowRight, Laptop, Monitor, Terminal, MessageCircle } from "lucide-react";
import Link from "next/link";
import MobileNavigation from "@/components/MobileNavigation";

export default function CommonErrors() {
  const errorCategories = [
    {
      title: "GENERAL ERRORS",
      description: "Common issues that can occur across all operating systems and environments.",
      icon: Terminal,
      href: "/common-errors/general-errors",
    },
    {
      title: "MACOS ERRORS",
      description: "Specific issues and solutions for macOS users.",
      icon: Laptop,
      href: "/common-errors/mac-errors",
    },
    {
      title: "WINDOWS ERRORS",
      description: "Common problems encountered on Windows systems.",
      icon: Monitor,
      href: "/common-errors/windows-errors",
    },
  ];

  return (
    <>
      <MobileNavigation />
      <div className="overflow-auto no-scrollbar">
        <div className="max-w-4xl mx-auto p-8 pt-8 border-r border-l border-zinc-200 dark:border-zinc-800">
          <h1 className="text-4xl md:text-6xl text-center font-black text-foreground tracking-tight mb-16">
            Common Errors
          </h1>

          <div className="mb-16">
            <div className="grid gap-px bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800">
              {errorCategories.map((category, index) => (
                <div
                  key={category.title}
                  className="group border-0 bg-white dark:bg-background hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors duration-200"
                >
                  <Link href={category.href}>
                    <div className="p-8 cursor-pointer">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-8 h-8 border border-current flex items-center justify-center">
                          <category.icon className="w-4 h-4" />
                        </div>
                        <div className="text-xs font-mono text-zinc-400 dark:text-zinc-600">
                          {String(index + 1).padStart(2, '0')}
                        </div>
                      </div>

                      <h3 className="text-xl font-black mb-3 text-foreground">
                        {category.title}
                      </h3>

                      <p className="text-sm text-zinc-600 dark:text-zinc-400 font-mono mb-6">
                        {category.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 group-hover:text-foreground dark:group-hover:text-foreground transition-colors">
                          VIEW ERRORS
                          <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                        <div className="h-px w-4 bg-zinc-800 origin-right scale-x-100 group-hover:scale-x-150 transition-transform duration-300" />
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <div className="max-w-2xl mx-auto border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-background p-8">
              <div className="flex items-center justify-center mb-6">
                <div className="w-12 h-12 border border-current flex items-center justify-center">
                  <MessageCircle className="w-6 h-6" />
                </div>
              </div>
              <h2 className="text-xl font-black text-foreground mb-4">
                Still Need Help?
              </h2>
              <p className="text-sm text-muted-foreground font-mono">
                Can't find a solution? Contact any of the teaching assistants for help.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
