import { useEffect, useState } from "react";
import { Maximize2 } from "lucide-react";
import { ConsoleLine } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Props {
  output: ConsoleLine[];
}

function Console({ output }: Props) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isPopupOpen) {
        setIsPopupOpen(false);
        // Remove focus from the expand button if we use the ESC key
        const button = document.activeElement as HTMLElement;
        button.blur();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isPopupOpen]);

  const renderOutput = () => {
    return (
      <div className="h-full p-2 border-2 border-accent-light rounded-md text-xs overflow-auto whitespace-nowrap scrollbar">
        {output.map((line, id) => (
          <div key={id} className={line.has_error ? "text-destructive" : ""}>
            {line.message}
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="w-full h-full mt-8 flex flex-col overflow-auto">
        <div className="flex justify-between items-center">
          <h2 className="font-bold">Console</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsPopupOpen(true)}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
        {renderOutput()}
      </div>
      <Dialog open={isPopupOpen} onOpenChange={setIsPopupOpen}>
        <DialogContent className="min-w-[90vw] h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Console</DialogTitle>
            <DialogDescription>Press ESC to close</DialogDescription>
          </DialogHeader>
          {renderOutput()}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default Console;
