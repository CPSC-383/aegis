import Card from "@/components/Card";
import { Cpu, Rocket, Terminal, TriangleAlert } from "lucide-react";

function Home() {
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
        <Card
          title="Getting Started"
          description="A step-by-step guide to quickly install and set up Aegis."
          link="/getting-started"
          icon={Rocket}
        />
        <Card
          title="Aegis System"
          description="An overview of the Aegis system and its key components."
          link="/getting-started/aegis/system"
          icon={Cpu}
        />
        <Card
          title="API Reference"
          description="Explore the Aegis API, including all available functions and their usage."
          link="/docs"
          icon={Terminal}
        />
        <Card
          title="Common Errors"
          description="Identify and resolve common errors when working with Aegis."
          link="common-errors"
          icon={TriangleAlert}
        />
      </div>
    </div>
  );
}

export default Home;
