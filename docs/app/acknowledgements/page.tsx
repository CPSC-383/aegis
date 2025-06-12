import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Award } from "lucide-react";
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
        <div className="max-w-4xl mx-auto p-8 pt-8 border-r border-l border-zinc-200 dark:border-zinc-800">
          <h1 className="text-4xl md:text-6xl text-center font-black text-foreground tracking-tight mb-16">
            Acknowledgments
          </h1>

          <p className="text-center text-sm text-muted-foreground mb-16">
            Aegis would not be what it is today without the contributions of many dedicated individuals.
          </p>

          <div className="grid md:grid-cols-2 gap-px bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800">
            {contributors.map((contributor, index) => (
              <Card
                key={contributor.name}
                className="group border-0 rounded-none bg-zinc-50 dark:bg-zinc-950"
              >
                <div className="p-8 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={contributor.avatar} alt={contributor.name} />
                      <AvatarFallback className="font-black">{contributor.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="text-xs font-mono text-zinc-400 dark:text-zinc-600">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                  </div>

                  <h3 className="text-xl font-black mb-3 text-foreground">
                    {contributor.name}
                  </h3>

                  <div className="flex items-center mb-3">
                    <Award className="w-4 h-4 mr-2 text-zinc-500 dark:text-zinc-400" />
                    <span className="text-xs text-zinc-600 dark:text-zinc-400 uppercase">
                      {contributor.role}
                    </span>
                  </div>

                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
                    {contributor.contribution}
                  </p>

                  <div className="flex gap-3 mt-auto">
                    <Link href={contributor.social.github} target="_blank" rel="noopener noreferrer" className="flex-1">
                      <Button variant="outline" className="w-full text-xs">
                        <Github className="w-4 h-4 mr-2" />
                        GitHub
                      </Button>
                    </Link>
                    <Link href={contributor.social.linkedin} target="_blank" rel="noopener noreferrer" className="flex-1">
                      <Button variant="outline" className="w-full text-xs">
                        <Linkedin className="w-4 h-4 mr-2" />
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
    </>
  );
}
