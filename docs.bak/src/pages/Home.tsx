import { Link } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Cpu, Rocket, Terminal, TriangleAlert } from "lucide-react";

function Home() {
  const cardData = [
    {
      title: "Getting Started",
      description: "A step-by-step guide to quickly install and set up Aegis.",
      link: "/getting-started",
      icon: Rocket,
    },
    {
      title: "Aegis System",
      description: "An overview of the Aegis system and its key components.",
      link: "/getting-started/aegis/system",
      icon: Cpu,
    },
    {
      title: "API Reference",
      description:
        "Explore the Aegis API, including all available functions and their usage.",
      link: "/docs",
      icon: Terminal,
    },
    {
      title: "Common Errors",
      description:
        "Identify and resolve common errors when working with Aegis.",
      link: "common-errors",
      icon: TriangleAlert,
    },
  ];

  return (
    <div className="p-6 text-gray-600 dark:text-gray-300">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100">
        Welcome to the Aegis Documentation
      </h1>
      <blockquote className="border-l-4 border-light-primary dark:border-dark-primary pl-4 italic text-gray-600 dark:text-gray-300 my-8">
        <p className="text-lg">
          Aegis, pronounced "ee-jis," originates from ancient Greek, meaning
          "shield", "protection" or "support."
        </p>
        <p className="text-lg mt-2">
          In the context of your assignment, Aegis symbolizes the protective
          role of agents as they save survivors.
        </p>
      </blockquote>
      <div className="mt-2 text-lg">
        <p>
          Find all the information you need to get started, understand Aegis's
          components, and how to use its features.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 mt-8">
        {cardData.map((card, index) => (
          <Link to={card.link} key={index}>
            <Card className="block w-full cursor-pointer border border-gray-950/10 dark:border-white/10 hover:border-light-primary dark:hover:border-dark-primary rounded-xl">
              <CardHeader className="flex flex-row items-center space-x-4">
                <card.icon className="w-6 h-6 text-primary" />
                <div>
                  <CardTitle>{card.title}</CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Home;
