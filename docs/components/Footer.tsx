import { Separator } from "@/components/ui/separator";
import { GraduationCap, BookOpen } from "lucide-react";

export default function Footer() {
  return (
    <div className="max-w-7xl w-full mx-auto">
      <Separator />
      <footer className="w-full py-4 text-center text-sm text-muted-foreground flex justify-between items-center">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          <p className="font-semibold">CPSC 383</p>
        </div>
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          <p>
            Documentation made by <span className="font-semibold">Goob</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
