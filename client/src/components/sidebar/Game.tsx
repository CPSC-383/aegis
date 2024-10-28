import { useAppContext } from '@/context'
import { EventType, listenEvent } from '@/events'
import { useForceUpdate } from '@/utils/util'
import { GroupStats } from '@/utils/types'

type Props = {
    isOpen: boolean
}

function Game({ isOpen }: Props) {
    const { appState } = useAppContext()
    const forceUpdate = useForceUpdate()
    listenEvent(EventType.RENDER, forceUpdate)

    if (!isOpen) return null

    if (!appState.simulation) {
        return (
            <div className="flex items-center p-4 h-60">
                <p className="text-lg font-bold text-center text-black">
                    Run A Simulation To See Game Stats!
                </p>
            </div>
        );
    }

    // if (!isOpen || !appState.simulation) return null

    const stats = appState.simulation.getStats()
    console.log(stats)

    return (
        <div className="p-4">
            {stats.worldStats.AgentsAlive === 0 && stats.groupStats.length === 0 ? (
                <div className="flex items-center justify-center h-1/2 bg-gray-200 rounded-lg">
                    <p className="text-lg font-bold text-center text-black">Run a game to see game stats!</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {Object.entries(stats.worldStats).map(([key, value]) => (
                            <div key={key} className="flex">
                                <div className="w-1 h-full bg-accent-light"></div>
                                <div className="flex-1 p-4 bg-gradient-to-r from-background to-transparent bg-opacity-60 flex items-center">
                                    <div className="flex-grow">
                                        <p className="text-xs font-medium text-black">
                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                        </p>
                                        <p className="text-lg font-bold text-black">{value}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Group Stats Table */}
                    <div className="mt-6 overflow-x-auto">
                        <table className="min-w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="px-4 py-2 text-left">Group ID</th>
                                    <th className="px-4 py-2 text-left">Group Name</th>
                                    <th className="px-4 py-2 text-left">Survivors Saved</th>
                                    <th className="px-4 py-2 text-left">Correct Predictions</th>
                                    <th className="px-4 py-2 text-left">Incorrect Predictions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.groupStats.map((group) => (
                                    <tr key={group.gid} className="border-b">
                                        <td className="px-4 py-2">{group.gid}</td>
                                        <td className="px-4 py-2">{group.name}</td>
                                        <td className="px-4 py-2">{group.SurvivorsSaved}</td>
                                        <td className="px-4 py-2">{group.CorrectPredictions}</td>
                                        <td className="px-4 py-2">{group.IncorrectPredictions}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    )
}

export default Game
