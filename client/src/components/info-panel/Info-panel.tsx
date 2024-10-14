import { useEffect, useState } from 'react'
import { useAppContext } from '@/context'
import { EventType, listenEvent } from '@/events'
import { AgentInfoDict, CellDict, StackContent } from '@/utils/types'
import AgentPanel from './Agent-panel'
import CellPanel from './Cell-panel'

function InfoPanel() {
    const { appState } = useAppContext()
    const { simulation, selectedCell } = appState
    const [cellInfo, setCellInfo] = useState<CellDict | undefined>()
    const [cellLayers, setCellLayers] = useState<StackContent[]>([])
    const [agents, setAgents] = useState<AgentInfoDict[]>([])
    const [selectedAgent, setSelectedAgent] = useState<AgentInfoDict | undefined>()

    const gatherData = () => {
        if (!simulation || !selectedCell) return

        const { x, y } = selectedCell

        setCellInfo(simulation.getInfoAtCell(x, y))
        setCellLayers(simulation.getLayersAtCell(x, y))
        setAgents(simulation.getAgentsAtCell(x, y))
    }

    // This is to get the info for a new
    // selected cell, or when the sim started
    useEffect(() => {
        gatherData()
        setSelectedAgent(undefined)
    }, [simulation, selectedCell])

    // This will update the cell every round
    listenEvent(EventType.RENDER, gatherData)

    if (!simulation || !selectedCell) {
        return <div className="p-4 mx-auto">Select a cell when a map is loaded!</div>
    }

    return (
        <div className="absolute w-full h-screen p-4">
            <div className="h-full space-y-4 p-4 border-2 border-gray-300 bg-white shadow-md rounded-md overflow-auto">
                {selectedAgent && (
                    <AgentPanel
                        selectedAgent={selectedAgent}
                        setSelectedAgent={setSelectedAgent}
                        setCellLayers={setCellLayers}
                        simulation={simulation}
                    />
                )}
                {!selectedAgent && (
                    <CellPanel
                        selectedCell={selectedCell}
                        setSelectedAgent={setSelectedAgent}
                        cellInfo={cellInfo}
                        agents={agents}
                        simulation={simulation}
                    />
                )}
                <div className="m-2">
                    <h3 className="text-lg border-b border-gray-300 pb-2 mb-2">Layers</h3>
                    <div className={`${cellLayers.length === 0 ? 'py-2' : 'p-4'}`}>
                        {cellLayers.length === 0 ? (
                            <p className="text-gray-500">Nothing at this location.</p>
                        ) : (
                            <div className="relative border-s border-accent">
                                {cellLayers
                                    .slice()
                                    .reverse()
                                    .map((layer, index) => (
                                        <div key={index} className="flex items-center mb-10 ms-6">
                                            <div className="absolute flex items-center justify-center w-8 h-8 bg-primary rounded-full -start-4 ring-4 ring-white">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="text-sm">
                                                    {layer.type.toUpperCase()}(
                                                    {Object.values(layer.arguments).join(', ')})
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default InfoPanel
