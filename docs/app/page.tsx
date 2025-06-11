"use client"

import { Card } from "@/components/ui/card";
import { ArrowRight, Cpu, Rocket, Terminal, TriangleAlert } from "lucide-react";
import Link from "next/link";
import MobileNavigation from "@/components/MobileNavigation";
import AssignmentSwitch from "@/components/AssignmentSwitch";
import { useAssignment } from "@/contexts/AssignmentContext";

export default function Home() {
  const { assignment } = useAssignment()

  const cardData = [
    {
      title: "GETTING STARTED",
      description: "Installation and setup guide",
      href: `/${assignment}/getting-started/installation`,
      icon: Rocket,
    },
    {
      title: "AEGIS SYSTEM",
      description: "System overview and components",
      href: `/${assignment}/getting-started/aegis/system`,
      icon: Cpu,
    },
    {
      title: "API REFERENCE",
      description: "Functions and usage documentation",
      href: `/${assignment}/docs/intro`,
      icon: Terminal,
    },
    {
      title: "COMMON ERRORS",
      description: "Error identification and resolution",
      href: `/common-errors`,
      icon: TriangleAlert,
    },
  ];

  return (
    <>
      <MobileNavigation />
      <div className="overflow-auto no-scrollbar">
        <div className="max-w-4xl mx-auto p-8 pt-8 border-r border-l border-zinc-200 dark:border-zinc-800">
          <h1 className="text-4xl md:text-6xl text-center font-black text-foreground tracking-tight">
            Welcome to Aegis
          </h1>

          <div className="my-16 flex flex-col items-center justify-center">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-4 h-4 bg-black dark:bg-white rotate-45"></div>
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                CURRENT ASSIGNMENT
              </span>
            </div>
            <div className="border border-zinc-200 dark:border-zinc-800 p-4">
              <AssignmentSwitch />
            </div>
          </div>

          <div className="mb-16">
            <div className="border-l border-zinc-200 dark:border-zinc-800">
              <div className="p-8">
                <div className="flex items-start gap-6">
                  <div className="w-px h-20 bg-black dark:bg-white"></div>
                  <div>
                    <h2 className="text-2xl font-black mb-4 text-foreground">
                      DEFINITION
                    </h2>
                    <p className="text-zinc-900 dark:text-zinc-100 mb-3 font-medium">
                      Aegis (ee-jis) - Shield, protection, support
                    </p>
                    <p className="text-zinc-600 dark:text-zinc-400 font-mono text-sm">
                      Protective role of agents in survivor rescue operations
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-16">
            <div className="grid md:grid-cols-2 gap-px bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800">
              {cardData.map((card, index) => (
                <Card
                  key={card.title}
                  className="group border-0 rounded-none bg-white dark:bg-background hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors duration-200"
                >
                  <Link href={card.href}>
                    <div className="p-8 cursor-pointer">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-8 h-8 border border-current flex items-center justify-center">
                          <card.icon className="w-4 h-4" />
                        </div>
                        <div className="text-xs font-mono text-zinc-400 dark:text-zinc-600">
                          {String(index + 1).padStart(2, '0')}
                        </div>
                      </div>

                      <h3 className="text-xl font-black mb-3 text-foreground">
                        {card.title}
                      </h3>

                      <p className="text-sm text-zinc-600 dark:text-zinc-400 font-mono mb-6">
                        {card.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 group-hover:text-foreground dark:group-hover:text-foreground transition-colors">
                          READ MORE
                          <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                        <div className="h-px w-4 bg-zinc-800 origin-right scale-x-100 group-hover:scale-x-150 transition-transform duration-300" />
                      </div>
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
