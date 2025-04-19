import { Card } from "@/components/ui/card";
import { Users } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import MobileNavigation from "@/components/MobileNavigation";

export default function AcknowledgmentPage() {
  const contributors = [
    {
      name: "Dante Kirsman",
      contribution:
        "Contributed to the development of Aegis and built this documentation website.",
    },
    {
      name: "Colton Gowans",
      contribution: "Contributed to the development of Aegis.",
    },
  ];

  return (
    <>
      <MobileNavigation />
      <div className="flex flex-col h-full max-w-7xl mx-auto p-6">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
              Acknowledgments
            </h1>
            <blockquote className="border-l-4 border-light-primary dark:border-dark-primary pl-6 italic my-8">
              <p className="text-lg text-muted-foreground">
                Aegis would not be what it is today without the contributions of
                many dedicated individuals.
              </p>
            </blockquote>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 mt-8">
            {contributors.map((contributor) => (
              <Card
                key={contributor.name}
                className="flex flex-col items-start justify-center shadow-lg rounded-2xl transition-all duration-300 transform hover:scale-105"
              >
                <div className="p-6 flex flex-col justify-center items-start space-y-4 h-full">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage
                        src={`https://ui-avatars.com/api/?name=${contributor.name}`}
                        alt={contributor.name}
                      />
                      <AvatarFallback>
                        <Users className="w-8 h-8 text-light-primary dark:text-dark-primary" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        {contributor.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {contributor.contribution}
                      </p>
                    </div>
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
