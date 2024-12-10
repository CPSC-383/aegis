import { useState, MouseEvent } from 'react'
import { useAppContext } from '@/context'

function Timeline() {
    const { appState } = useAppContext()
    const { simulation } = appState
    const maxRounds = simulation ? simulation.maxRounds : 0
    const timelineWidth = 300

    const [isHovering, setIsHovering] = useState(false)

    const handleSeek = (e: MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const round = Math.floor((x / timelineWidth) * maxRounds)
        simulation!.jumpToRound(round)
    }

    if (!simulation) {
        return (
            <div className="text-xs text-gray-500 flex items-center justify-center" style={{ minWidth: timelineWidth }}>
                Waiting for simulation information...
            </div>
        )
    }

    const round = simulation.currentRound
    const progressPercentage = maxRounds ? (round / maxRounds) * 100 : 0

    return (
        <div className="w-full mx-auto">
            <div className="flex justify-center items-center mb-1">
                <span className="text-xs text-gray-600">Round:</span>
                <span className="text-xs ml-1">
                    <b>{round}</b> / {maxRounds}
                </span>
            </div>

            <div
                className="relative h-2 bg-gray-300 rounded-full cursor-pointer overflow-hidden"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                onClick={handleSeek}
                style={{ minWidth: timelineWidth }}
            >
                <div
                    className="absolute h-full bg-accent-light rounded-full transition-all duration-300 ease-in-out"
                    style={{ width: `${progressPercentage}%` }}
                />
            </div>

            {isHovering && (
                <div className="absolute -top-8 left-28 bg-black text-white text-xs px-2 py-1 rounded shadow-lg">
                    Click to jump to a specific round
                </div>
            )}
        </div>
    )
}

export default Timeline
