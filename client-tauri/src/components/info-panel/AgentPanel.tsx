import { EventType, listenEvent } from "@/events";
import { Simulation, AgentInfoDict } from "@/core/simulation";
import { StackContent } from "@/core/world";

type Props = {
  selectedAgent: AgentInfoDict;
  setSelectedAgent: (value: AgentInfoDict | undefined) => void;
  setCellLayers: (value: StackContent[]) => void;
  simulation: Simulation;
};

function AgentPanel({
  selectedAgent,
  setSelectedAgent,
  setCellLayers,
  simulation,
}: Props) {
  const updateSelectedAgentInfo = () => {
    if (!selectedAgent) return;
    const agent = simulation!.getAgentWithIds(
      selectedAgent.id,
      selectedAgent.gid,
    );
    const layers = simulation!.getLayersAtCell(
      selectedAgent.x,
      selectedAgent.y,
    );
    setSelectedAgent(agent);
    setCellLayers(layers);
  };

  listenEvent(EventType.RENDER, updateSelectedAgentInfo);

  return (
    <div className="m-2">
      <h2 className="font-bold text-center mb-4">
        Agent - ID: {selectedAgent.id}, GID: {selectedAgent.gid}
      </h2>
      <h3 className="text-lg border-b border-gray-300 pb-2 mb-2">Agent Info</h3>
      <div className="py-2 flex flex-col gap-2 text-sm">
        <span>
          Location: ({selectedAgent.x}, {selectedAgent.y})
        </span>
        <span>Energy: {selectedAgent.energy_level}/1000</span>
        <span>Command Sent: {selectedAgent.command_sent}</span>
      </div>
    </div>
  );
}

export default AgentPanel;
