import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Users, Award } from "lucide-react";
import { FiLinkedin as Linkedin, FiGithub as Github } from "react-icons/fi";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import MobileNavigation from "@/components/MobileNavigation";

export default function AcknowledgmentPage() {
  const contributors = [
    {
      name: "Dante Kirsman",
      role: "Developer & Documentation",
      contribution: "Contributed to the development of Aegis and built this comprehensive documentation website.",
      avatar: "https://ui-avatars.com/api/?name=Dante+Kirsman&background=0f766e&color=fff&size=128",
      gradient: "from-teal-500 to-cyan-500",
      bgColor: "bg-teal-50 dark:bg-teal-950/20",
      social: {
        github: "https://github.com/daannte",
        linkedin: "https://www.linkedin.com/in/dantekirsman/",
      }
    },
    {
      name: "Colton Gowans",
      role: "Developer",
      contribution: "Contributed to the development of Aegis, focusing on algorithm implementation and system architecture.",
      avatar: "https://ui-avatars.com/api/?name=Colton+Gowans&background=7c3aed&color=fff&size=128",
      gradient: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
      social: {
        github: "https://github.com/ColtG5",
        linkedin: "https://www.linkedin.com/in/colton-gowans/",
      }
    },
  ];

  return (
    <>
      <MobileNavigation />
      <div className="overflow-auto no-scrollbar">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 pt-8 sm:pt-12">
          <div className="text-center mb-12 sm:mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 px-2">
              Acknowledgments
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-6 sm:mb-8 px-4">
              Aegis would not be what it is today without the contributions of many dedicated individuals.
            </p>
          </div>

          <div className="mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-8 sm:mb-12 px-4">
              Meet the Team
            </h2>

            <div className="grid gap-6 sm:gap-8 md:grid-cols-2 max-w-4xl mx-auto px-2 sm:px-0">
              {contributors.map((contributor) => (
                <Card
                  key={contributor.name}
                  className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 sm:hover:-translate-y-2 bg-white dark:bg-slate-800"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${contributor.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

                  <div className="relative p-4 sm:p-6 lg:p-8">
                    <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 lg:space-x-6 mb-4 sm:mb-6">
                      <div className="relative flex-shrink-0">
                        <div className={`absolute inset-0 bg-gradient-to-br ${contributor.gradient} rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300`}></div>
                        <Avatar className="relative w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 border-4 border-white dark:border-slate-700 shadow-lg">
                          <AvatarImage
                            src={contributor.avatar}
                            alt={contributor.name}
                            className="object-cover"
                          />
                          <AvatarFallback className={`${contributor.bgColor} text-xl lg:text-2xl font-bold`}>
                            <Users className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-teal-600 dark:text-teal-400" />
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      <div className="text-center sm:text-left">
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-teal-600 group-hover:to-purple-600 transition-all duration-300">
                          {contributor.name}
                        </h3>
                        <div className="flex items-center justify-center sm:justify-start space-x-2 mb-2 sm:mb-0">
                          <Award className="w-3 h-3 sm:w-4 sm:h-4 text-teal-600 dark:text-teal-400" />
                          <span className="text-sm font-medium text-teal-600 dark:text-teal-400">
                            {contributor.role}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed mb-4 sm:mb-6 text-center sm:text-left">
                      {contributor.contribution}
                    </p>

                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                      <Link href={contributor.social.github} target="_blank" rel="noopener noreferrer" className="flex-1">
                        <Button
                          variant="outline"
                          className="w-full hover:bg-teal-50 dark:hover:bg-teal-950/20 hover:border-teal-300 dark:hover:border-teal-700 text-sm sm:text-base"
                        >
                          <Github className="mr-2 w-4 h-4" />
                          GitHub
                        </Button>
                      </Link>
                      <Link href={contributor.social.linkedin} target="_blank" rel="noopener noreferrer" className="flex-1">
                        <Button
                          variant="outline"
                          className="w-full hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:border-blue-300 dark:hover:border-blue-700 text-sm sm:text-base"
                        >
                          <Linkedin className="mr-2 w-4 h-4" />
                          LinkedIn
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
