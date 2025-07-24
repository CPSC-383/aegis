import { useAppStore } from '@/store/useAppStore'
import { useCallback, useEffect, useState } from 'react'
import AgentPanel from './Agent-panel'
import CellPanel from './Cell-panel'

const InfoPanel = (): JSX.Element => {
  // FIX: this whole thing needs refactoring
  // Determine which simulation and selectedCell to use
  // const isEditor = Boolean(appState.editorSimulation)
  // const simulation = isEditor ? appState.editorSimulation : appState.simulation
  // const selectedCell = isEditor ? appState.editorSelectedCell : appState.selectedCell
  //
  // const [cellInfo, setCellInfo] = useState<CellDict | undefined>()
  // const [cellLayers, setCellLayers] = useState<CellContent[]>([])
  // const [agents, setAgents] = useState<AgentInfoDict[]>([])
  // const [selectedAgent, setSelectedAgent] = useState<AgentInfoDict | undefined>()
  // const [spawns, setSpawns] = useState<SpawnZoneData | undefined>(undefined)

  // const gatherData = useCallback((): void => {
  //   if (!simulation || !selectedCell) return
  //
  //   const { x, y } = selectedCell
  //
  //   setCellInfo(simulation.getInfoAtCell(x, y))
  //   setCellLayers(simulation.getLayersAtCell(x, y))
  //
  //   // Only get agents if this is a normal simulation (not editor)
  //   if (!isEditor) {
  //     setAgents(simulation.getAgentsAtCell(x, y))
  //   } else {
  //     setAgents([]) // No agents in editor mode
  //   }
  //
  //   setSpawns(simulation.getSpawns(x, y))
  // }, [simulation, selectedCell, isEditor])

  // This is to get the info for a new
  // selected cell, or when the sim started
  // useEffect(() => {
  //   gatherData()
  //   setSelectedAgent(undefined)
  // }, [simulation, selectedCell, isEditor, gatherData])
  //

  if (true) {
    return <div>TODO</div>
  }

  // if (!simulation || !selectedCell) {
  //   return <div className="p-4 mx-auto">Select a cell when a map is loaded!</div>
  // }
  //
  // return (
  //   <div className="absolute w-full h-screen p-4">
  //     <div className="h-full space-y-4 p-4 border-2 border-gray-300 bg-white shadow-md rounded-md overflow-auto scrollbar">
  //       {selectedAgent && (
  //         <AgentPanel
  //           selectedAgent={selectedAgent}
  //           setSelectedAgent={setSelectedAgent}
  //           setCellLayers={setCellLayers}
  //           simulation={simulation}
  //         />
  //       )}
  //       {!selectedAgent && (
  //         <CellPanel
  //           selectedCell={selectedCell}
  //           setSelectedAgent={setSelectedAgent}
  //           cellInfo={cellInfo}
  //           agents={agents}
  //           simulation={simulation}
  //         />
  //       )}
  //       <div className="m-2">
  //         <h3 className="text-lg border-b border-gray-300 pb-2 mb-2">Layers</h3>
  //         <div className={`${cellLayers.length === 0 ? 'py-2' : 'p-4'}`}>
  //           {cellLayers.length === 0 ? (
  //             <p className="text-gray-500">Nothing at this location.</p>
  //           ) : (
  //             <div className="relative border-s border-gray-600">
  //               {cellLayers
  //                 .slice()
  //                 .reverse()
  //                 .map((layer, index) => (
  //                   <div key={index} className="flex items-center mb-10 ms-6">
  //                     <div className="absolute flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full -start-4 ring-4 ring-white">
  //                       {index + 1}
  //                     </div>
  //                     <div>
  //                       <p className="text-sm">
  //                         {layer.type.toUpperCase()}(
  //                         {Object.values(layer.arguments).join(', ')})
  //                       </p>
  //                     </div>
  //                   </div>
  //                 ))}
  //             </div>
  //           )}
  //         </div>
  //       </div>
  //       {spawns && (
  //         <div className="m-2">
  //           <h3 className="text-lg border-b border-gray-300 pb-2 mb-2">Spawn</h3>
  //           {!spawns ? (
  //             <p className="text-gray-500">Nothing at this location.</p>
  //           ) : (
  //             <>
  //               <div>Type: {spawns.type}</div>
  //               {spawns.type === SpawnZoneTypes.Group && (
  //                 <div>
  //                   Groups:{' '}
  //                   {spawns.groups.map((group, index) => (
  //                     <span key={index}>
  //                       {group}
  //                       {index < spawns.groups.length - 1 ? ', ' : ''}
  //                     </span>
  //                   ))}
  //                 </div>
  //               )}
  //             </>
  //           )}
  //         </div>
  //       )}
  //     </div>
  //   </div>
  // )
}

export default InfoPanel
