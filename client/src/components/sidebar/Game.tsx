import { useAppContext } from '@/context'
import { EventType, listenEvent } from '@/events'
import { ASSIGNMENT_A3, getCurrentAssignment, useForceUpdate } from '@/utils/util'
import { motion } from 'framer-motion'
import { AlertTriangle, Trophy } from 'lucide-react'

function Game() {
    const { appState } = useAppContext()
    const forceUpdate = useForceUpdate()
    listenEvent(EventType.RENDER, forceUpdate)

    if (!appState.simulation) {
        return (
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex justify-center items-center h-60"
            >
                <div className="text-center p-4">
                    <AlertTriangle className="mx-auto mb-4" size={48} />
                    <p className="text-lg font-bold text-center text-black">Run A Simulation To See Game Stats!</p>
                </div>
            </motion.div>
        )
    }

    if (appState.simulation.getRoundNumber() === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex justify-center items-center h-60"
            >
                <div className="text-center p-4">
                    <Trophy className="mx-auto mb-4" size={48} />
                    <p className="text-lg font-bold text-center text-black">
                        Game Stats Will Be Available After The First Round!
                    </p>
                </div>
            </motion.div>
        )
    }

    const stats = appState.simulation.getStats()

    return (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="p-2 max-h-60 scrollbar overflow-auto">
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    {Object.entries(stats.worldStats).map(([key, stat]) => (
                        <div key={key} className="flex">
                            <div className="w-1 h-full bg-foreground"></div>
                            <div className="flex-1 p-4 bg-gradient-to-r from-background to-transparent bg-opacity-60 flex items-center">
                                <div className="mr-4">{stat.icon && <stat.icon />}</div>
                                <div className="flex-grow">
                                    <p className="text-xs font-medium text-black">
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </p>
                                    <p className="text-lg font-bold text-black">{stat.value}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {getCurrentAssignment() === ASSIGNMENT_A3 && (
                    <div className="mt-6 overflow-x-auto">
                        <table className="min-w-full text-sm border-collapse border text-center">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="px-2 py-2">Group Stats Table</th>
                                    {stats.groupStats!.map((group) => (
                                        <th key={group.gid} className="px-4 py-2">
                                            {group.name}
                                            <br /> ID: {group.gid}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b">
                                    <td className="px-2 py-2">
                                        Survivors
                                        <br />
                                        Saved
                                    </td>
                                    {stats.groupStats!.map((group) => (
                                        <td key={group.gid} className="px-4 py-2">
                                            {group.SurvivorsSaved}
                                        </td>
                                    ))}
                                </tr>
                                <tr className="border-b">
                                    <td className="px-2 py-2">
                                        Correct
                                        <br />
                                        Predictions
                                    </td>
                                    {stats.groupStats!.map((group) => (
                                        <td key={group.gid} className="px-4 py-2">
                                            {group.CorrectPredictions}
                                        </td>
                                    ))}
                                </tr>
                                <tr className="border-b">
                                    <td className="px-2 py-2">
                                        Incorrect
                                        <br />
                                        Predictions
                                    </td>
                                    {stats.groupStats!.map((group) => (
                                        <td key={group.gid} className="px-4 py-2">
                                            {group.IncorrectPredictions}
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </motion.div>
    )
}

export default Game
