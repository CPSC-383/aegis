import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Cpu, Rocket, Terminal, TriangleAlert } from "lucide-react";
import Link from "next/link";

export default function CommonErrors() {
  const cardData = [
    {
      title: "Getting Started",
      description: "A step-by-step guide to quickly install and set up Aegis.",
      href: "/getting-started/installation",
      icon: Rocket,
    },
    {
      title: "Aegis System",
      description: "An overview of the Aegis system and its key components.",
      href: "/getting-started/aegis/system",
      icon: Cpu,
    },
    {
      title: "API Reference",
      description:
        "Explore the Aegis API, including all available functions and their usage.",
      href: "/docs/intro",
      icon: Terminal,
    },
    {
      title: "Common Errors",
      description:
        "Identify and resolve common errors when working with Aegis.",
      href: "/common-errors",
      icon: TriangleAlert,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
            Welcome to the Aegis Documentation
          </h1>
          <blockquote className="border-l-4 border-light-primary dark:border-dark-primary pl-6 italic my-8">
            <p className="text-lg text-muted-foreground">
              Aegis, pronounced "ee-jis," originates from ancient Greek, meaning
              "shield", "protection" or "support."
            </p>
            <p className="text-lg text-muted-foreground mt-2">
              In the context of your assignment, Aegis symbolizes the protective
              role of agents as they save survivors.
            </p>
          </blockquote>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 mt-8">
          {cardData.map((card) => (
            <Card
              key={card.title}
              className="flex flex-col items-start shadow-lg rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="p-6 flex-1">
                <div className="bg-light-primary dark:bg-dark-primary/20 w-16 h-16 rounded-lg flex items-center justify-center mb-4">
                  <card.icon className="w-10 h-10 text-light-primary dark:text-dark-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {card.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {card.description}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0">
                <Link href={card.href} passHref>
                  <Button
                    variant="ghost"
                    aria-label={`Read more about ${card.title}`}
                    className="w-full gap-2 text-teal-500 dark:text-teal-400 group"
                  >
                    Read More
                    <ArrowRight className="w-4 h-4 transform transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
