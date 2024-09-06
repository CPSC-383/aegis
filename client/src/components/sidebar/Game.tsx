import { useAppContext } from '@/context'
import { EventType, listenEvent } from '@/events'
import { useForceUpdate } from '@/utils/util'

type Props = {
    isOpen: boolean
}

function Game({ isOpen }: Props) {
    const { appState } = useAppContext()

    const forceUpdate = useForceUpdate()
    listenEvent(EventType.RENDER, forceUpdate)

    if (!isOpen || !appState.simulation) return null

    const { currentRoundData } = appState.simulation

    const stats = {
        AgentsAlive: currentRoundData?.number_of_alive_agents ?? 0,
        AgentsDead: currentRoundData?.number_of_dead_agents ?? 0,
        SurvivorsAlive: currentRoundData?.number_of_survivors_alive ?? 0,
        SurvivorsDead: currentRoundData?.number_of_survivors_dead ?? 0,
        SurvivorsSavedAlive: currentRoundData?.number_of_survivors_saved_alive ?? 0,
        BodiesRecovered: currentRoundData?.number_of_survivors_saved_dead ?? 0,
        TotalSurvivorsAndBodies: currentRoundData?.number_of_survivors ?? 0,
        TotalSurvivorsSavedAndRecovered:
            (currentRoundData?.number_of_survivors_saved_alive ?? 0) +
            (currentRoundData?.number_of_survivors_saved_dead ?? 0)
    }

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {Object.entries(stats).map(([key, value]) => (
                <div key={key} className="flex">
                    <div className="w-1 h-full bg-accent-light"></div>
                    <div className="flex-1 p-4 bg-gradient-to-r from-background to-transparent bg-opacity-60 flex items-center">
                        <div className="flex-grow">
                            <p className="text-xs font-medium text-black">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                            <p className="text-lg font-bold text-black">{value}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default Game
