import { useAssignment } from "@/contexts/AssignmentContext";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";

export default function AssignmentSwitch() {
  const { toggleAssignment, isPathfinding, isMas } = useAssignment();

  return (
    <div className="flex flex-col items-center space-x-3 p-4 bg-card rounded-lg border">
      <div className="flex items-center space-x-2">
        <Label
          htmlFor="assignment-switch"
          className={`text-sm font-medium transition-colors ${isPathfinding ? "text-primary" : "text-muted-foreground"
            }`}
        >
          Pathfinding
        </Label>
        <Switch
          id="assignment-switch"
          checked={isMas}
          onCheckedChange={toggleAssignment}
        />
        <Label
          htmlFor="assignment-switch"
          className={`text-sm font-medium transition-colors ${isMas ? "text-primary" : "text-muted-foreground"
            }`}
        >
          MAS
        </Label>
      </div>
    </div>
  );
}
