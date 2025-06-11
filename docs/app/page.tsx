"use client"
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Cpu, Rocket, Terminal, TriangleAlert } from "lucide-react";
import Link from "next/link";
import MobileNavigation from "@/components/MobileNavigation";
import AssignmentSwitch from "@/components/AssignmentSwitch";
import { useAssignment } from "@/contexts/AssignmentContext";

export default function Home() {
  const { assignment } = useAssignment()

  const cardData = [
    {
      title: "Getting Started",
      description: "A step-by-step guide to quickly install and set up Aegis.",
      href: `/${assignment}/getting-started/installation`,
      icon: Rocket,
      gradient: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
    },
    {
      title: "Aegis System",
      description: "An overview of the Aegis system and its key components.",
      href: `/${assignment}/getting-started/aegis/system`,
      icon: Cpu,
      gradient: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
    },
    {
      title: "API Reference",
      description: "Explore the Aegis API, including all available functions and their usage.",
      href: `/${assignment}/docs/intro`,
      icon: Terminal,
      gradient: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50 dark:bg-green-950/20",
    },
    {
      title: "Common Errors",
      description: "Identify and resolve common errors when working with Aegis.",
      href: `/${assignment}/common-errors`,
      icon: TriangleAlert,
      gradient: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50 dark:bg-orange-950/20",
    },
  ];

  return (
    <>
      <MobileNavigation />
      <div className="overflow-auto no-scrollbar">
        <div className="max-w-7xl mx-auto p-6 pt-12">

          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
              Welcome to Aegis
            </h1>

            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Your comprehensive documentation hub for {assignment === 'pathfinding' ? 'pathfinding algorithms' : 'multi-agent systems'} and rescue operations
            </p>

            <div className="flex justify-center mb-4">
              <AssignmentSwitch />
            </div>

            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-teal-500/10 to-blue-500/10 border border-teal-200 dark:border-teal-800">
              <span className="text-sm font-medium text-teal-600 dark:text-teal-400">
                Assignment: {assignment.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="max-w-4xl mx-auto mb-16">
            <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-950/20 dark:to-blue-950/20">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-blue-500/5"></div>
              <div className="relative p-8">
                <div className="flex items-start space-x-4">
                  <div className="w-1 h-16 bg-gradient-to-b from-teal-500 to-blue-500 rounded-full"></div>
                  <div>
                    <blockquote className="space-y-4">
                      <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Aegis, pronounced "ee-jis," originates from ancient Greek, meaning "shield", "protection" or "support."
                      </p>
                      <p className="text-gray-600 dark:text-gray-300">
                        In the context of your assignment, Aegis symbolizes the protective role of agents as they save survivors.
                      </p>
                    </blockquote>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 mb-16">
            {cardData.map((card) => (
              <Card
                key={card.title}
                className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white dark:bg-zinc-800"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

                <div className="relative p-6 h-full flex flex-col">
                  <div className={`w-16 h-16 rounded-2xl ${card.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${card.gradient} flex items-center justify-center`}>
                      <card.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  <div className="flex-1 space-y-3">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-teal-600 group-hover:to-blue-600 transition-all duration-300">
                      {card.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {card.description}
                    </p>
                  </div>

                  <div className="mt-6 cursor-pointer">
                    <Link href={card.href} passHref>
                      <Button
                        variant="ghost"
                        aria-label={`Read more about ${card.title}`}
                        className="w-full group/button gap-2 text-gray-600 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/20 transition-all duration-300"
                      >
                        Read More
                        <ArrowRight className="w-4 h-4 transform transition-transform group-hover/button:translate-x-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Card className="inline-block border-0 shadow-lg bg-gradient-to-r from-teal-500 to-blue-600 dark:from-teal-600 dark:to-blue-700 text-white">
              <div className="p-8">
                <h2 className="text-2xl font-bold mb-2">Ready to get started?</h2>
                <p className="text-teal-100 dark:text-teal-200 mb-6">
                  Jump into the documentation and start building your agent.
                </p>
                <Link href={`/${assignment}/getting-started/installation`}>
                  <Button
                    className="bg-white dark:bg-zinc-900 text-teal-600 dark:text-teal-400 hover:bg-gray-100 dark:hover:bg-zinc-800 font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl dark:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  >
                    Get Started Now
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
