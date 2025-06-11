import { useAssignment } from "@/contexts/AssignmentContext";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";

export default function AssignmentSwitch() {
  const { toggleAssignment, isPathfinding, isMas } = useAssignment();

  return (
    <div className="border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center">
        <div className="px-4 py-3 border-r border-zinc-200 dark:border-zinc-800">
          <Label
            htmlFor="assignment-switch"
            className={`text-xs font-mono uppercase tracking-wider cursor-pointer transition-colors ${isPathfinding
              ? "text-black dark:text-white font-black"
              : "text-zinc-400 dark:text-zinc-600"
              }`}
          >
            PATHFINDING
          </Label>
        </div>

        <div className="px-4 py-3 border-r border-zinc-200 dark:border-zinc-800">
          <Switch
            id="assignment-switch"
            checked={isMas}
            onCheckedChange={toggleAssignment}
            className="data-[state=checked]:bg-black data-[state=unchecked]:bg-zinc-200 dark:data-[state=checked]:bg-white dark:data-[state=unchecked]:bg-zinc-800"
          />
        </div>

        <div className="px-4 py-3">
          <Label
            htmlFor="assignment-switch"
            className={`text-xs font-mono uppercase tracking-wider cursor-pointer transition-colors ${isMas
              ? "text-black dark:text-white font-black"
              : "text-zinc-400 dark:text-zinc-600"
              }`}
          >
            MAS
          </Label>
        </div>
      </div>
    </div>
  );
}
