import React from "react";
import { Users, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RubbleInfo } from "@/core/world";

interface Props {
  rubbleInfo: RubbleInfo;
  setRubbleInfo: (info: RubbleInfo) => void;
}

function RubbleSettings({ rubbleInfo, setRubbleInfo }: Props) {
  const handleEnergyBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      const newValue = Math.max(0, value);
      setRubbleInfo({
        ...rubbleInfo,
        remove_energy: newValue,
      });
    }
  };

  const handleAgentsBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      const newValue = Math.max(0, value);
      setRubbleInfo({
        ...rubbleInfo,
        remove_agents: newValue,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="remove-energy" className="flex items-center gap-2 mb-2">
          <Zap className="h-4 w-4 text-muted-foreground" />
          Energy to Remove:
        </Label>
        <Input
          id="remove-energy"
          type="number"
          value={rubbleInfo.remove_energy}
          onChange={(e) => {
            const value = e.target.value === "" ? 0 : Number(e.target.value);
            setRubbleInfo({
              ...rubbleInfo,
              remove_energy: value,
            });
          }}
          onBlur={handleEnergyBlur}
          className="w-full"
        />
      </div>

      <div>
        <Label htmlFor="remove-agents" className="flex items-center gap-2 mb-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          Required Agents:
        </Label>
        <Input
          id="remove-agents"
          type="number"
          value={rubbleInfo.remove_agents}
          onChange={(e) => {
            const value = e.target.value === "" ? 0 : Number(e.target.value);
            setRubbleInfo({
              ...rubbleInfo,
              remove_agents: value,
            });
          }}
          onBlur={handleAgentsBlur}
          className="w-full"
        />
      </div>
    </div>
  );
}

export default RubbleSettings;
