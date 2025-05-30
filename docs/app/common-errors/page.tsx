import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Laptop, Monitor, Terminal, MessageCircle, BookOpen } from "lucide-react";
import Link from "next/link";
import MobileNavigation from "@/components/MobileNavigation";

export default function CommonErrors() {
  const errorCategories = [
    {
      title: "General Errors",
      description: "Common issues that can occur across all operating systems and environments",
      icon: Terminal,
      href: "/common-errors/general-errors",
      gradient: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
    },
    {
      title: "macOS Errors",
      description: "Specific issues and solutions for macOS users",
      icon: Laptop,
      href: "/common-errors/mac-errors",
      gradient: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
    },
    {
      title: "Windows Errors",
      description: "Common problems encountered on Windows systems",
      icon: Monitor,
      href: "/common-errors/windows-errors",
      gradient: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50 dark:bg-green-950/20",
    },
  ];

  return (
    <>
      <MobileNavigation />
      <div className="overflow-auto no-scrollbar">
        <div className="max-w-7xl mx-auto p-6 pt-12">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 dark:from-white dark:via-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-6">
              Common Errors
            </h1>

            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Find quick solutions to common problems you might encounter while using Aegis.
            </p>
          </div>

          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
              <BookOpen className="w-6 h-6 mr-3 text-teal-600" />
              Browse by Platform
            </h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {errorCategories.map((category) => (
                <Card
                  key={category.title}
                  className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white dark:bg-slate-800"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

                  <div className="relative p-6 h-full flex flex-col">
                    <div className="relative mb-6">
                      <div className={`w-16 h-16 rounded-2xl ${category.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${category.gradient} flex items-center justify-center`}>
                          <category.icon className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-3">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-teal-600 group-hover:to-blue-600 transition-all duration-300">
                        {category.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {category.description}
                      </p>
                    </div>

                    {/* Button */}
                    <div className="mt-6">
                      <Link href={category.href}>
                        <Button
                          variant="ghost"
                          className="w-full group/button gap-2 text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/20 transition-all duration-300"
                        >
                          View Solutions
                          <ArrowRight className="w-4 h-4 transform transition-transform group-hover/button:translate-x-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Help Section */}
          <div className="text-center">
            <Card className="max-w-4xl mx-auto border-0 shadow-xl bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800 dark:to-slate-700">
              <div className="p-8">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-teal-500 to-blue-600 flex items-center justify-center">
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                  Still Need Help?
                </h2>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Can't find a solution to your problem? Contact any of the teaching assistants for help.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
