import Game from '@/core/Game'

type Props = {
  selectedAgent: AgentInfoDict
  setSelectedAgent: (value: AgentInfoDict | undefined) => void
  setCellLayers: (value: CellContent[]) => void
  game: Game
}

const AgentPanel = ({
  selectedAgent,
  setSelectedAgent,
  setCellLayers,
  game
}: Props): JSX.Element => {
  const updateSelectedAgentInfo = (): void => {
    if (!selectedAgent) return
    const agent = game!.getAgentWithIds(
      selectedAgent.agentId!.id,
      selectedAgent.agentId!.gid
    )
    const layers = game!.getLayersAtCell(
      selectedAgent.location!.x,
      selectedAgent.location!.y
    )
    setSelectedAgent(agent)
    setCellLayers(layers)
  }

  return (
    <div className="m-2">
      <h2 className="font-bold text-center mb-4">
        Agent - ID: {selectedAgent.agentId!.id}, GID: {selectedAgent.agentId!.gid}
      </h2>
      <h3 className="text-lg border-b border-gray-300 pb-2 mb-2">Agent Info</h3>
      <div className="py-2 flex flex-col gap-2 text-sm">
        <span>
          Location: ({selectedAgent.location!.x}, {selectedAgent.location!.y})
        </span>
        <span>Energy: {selectedAgent.energyLevel}/1000</span>
        <span>Steps Taken: {selectedAgent.stepsTaken}</span>
      </div>
    </div>
  )
}

export default AgentPanel
