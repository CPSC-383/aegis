import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Laptop, Monitor, Terminal } from "lucide-react";
import Link from "next/link";
import Footer from "@/components/Footer";

export default function CommonErrors() {
  const errorCategories = [
    {
      title: "General Errors",
      description:
        "Common issues that can occur across all operating systems and environments",
      icon: <Terminal className="w-12 h-12 text-primary" />,
      href: "/common-errors/general-errors",
    },
    {
      title: "macOS Errors",
      description: "Specific issues and solutions for macOS users",
      icon: <Laptop className="w-12 h-12 text-primary" />,
      href: "/common-errors/mac-errors",
    },
    {
      title: "Windows Errors",
      description: "Common problems encountered on Windows systems",
      icon: <Monitor className="w-12 h-12 text-primary" />,
      href: "/common-errors/windows-errors",
    },
  ];

  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Common Errors</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Find solutions to common problems you might encounter while using
            aegis.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {errorCategories.map((category) => (
            <Card
              key={category.title}
              className="flex flex-col items-start shadow-lg rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              <div className="p-6 flex-1">
                <div className="bg-secondary/20 w-16 h-16 rounded-lg flex items-center justify-center mb-4">
                  {category.icon}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-xl">{category.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                </div>
              </div>
              <div className="p-6 pt-0">
                <Link href={category.href} className="w-full">
                  <Button
                    variant="ghost"
                    className="w-full gap-2 dark:text-teal-400 text-teal-500 group"
                  >
                    View Solutions
                    <ArrowRight className="w-4 h-4 transform transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-8 rounded-lg border bg-card text-card-foreground p-6">
          <h2 className="text-lg font-semibold mb-2">Need More Help?</h2>
          <p className="text-muted-foreground">
            If you can't find a solution to your problem in these guides, feel
            free to reach out to any of the TAs for help.
          </p>
        </div>
      </div>
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
