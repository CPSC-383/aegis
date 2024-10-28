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
                <p className="text-lg font-bold text-center text-black">Run A Simulation To See Game Stats!</p>
            </div>
        )
    }

    if (appState.simulation.getRoundNumber() === 0) {
        return (
            <div className="flex items-center p-4 h-60">
                <p className="text-lg font-bold text-center text-black">Game Stats Will Be Available After The First Round!</p>
            </div>
        )
    }

    const stats = appState.simulation.getStats()

    return (
        <div className="p-4 max-h-60 scrollbar overflow-auto">
            {stats.worldStats.AgentsAlive === 0 && stats.groupStats.length === 0 ? (
                <div className="flex items-center p-4 h-60">
                    <p className="text-lg font-bold text-center text-black">Run A Simulation To See Game Stats!</p>
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

                    <div className="mt-6 overflow-x-auto">
                        <table className="min-w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="px-4 py-2 text-left">Metric</th>
                                    {stats.groupStats.map((group) => (
                                        <th key={group.gid} className="px-4 py-2 text-left">
                                            {group.name} (ID: {group.gid})
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b">
                                    <td className="px-4 py-2">Survivors Saved</td>
                                    {stats.groupStats.map((group) => (
                                        <td key={group.gid} className="px-4 py-2">
                                            {group.SurvivorsSaved}
                                        </td>
                                    ))}
                                </tr>
                                <tr className="border-b">
                                    <td className="px-4 py-2">Correct Predictions</td>
                                    {stats.groupStats.map((group) => (
                                        <td key={group.gid} className="px-4 py-2">
                                            {group.CorrectPredictions}
                                        </td>
                                    ))}
                                </tr>
                                <tr className="border-b">
                                    <td className="px-4 py-2">Incorrect Predictions</td>
                                    {stats.groupStats.map((group) => (
                                        <td key={group.gid} className="px-4 py-2">
                                            {group.IncorrectPredictions}
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    )
}

export default Game
