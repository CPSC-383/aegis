import { useAppContext } from '@/context'
import React from 'react'

function Timeline() {
    const { appState } = useAppContext()
    const { simulation } = appState
    const maxRounds = simulation ? simulation.maxRounds : 0
    const timelineWidth = 300

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const round = Math.floor((x / timelineWidth) * maxRounds)
        simulation!.jumpToRound(round)
    }

    if (!simulation) {
        return (
            <div className="text-xs flex items-center justify-center" style={{ minWidth: timelineWidth }}>
                Waiting for simulation information to show timeline.
            </div>
        )
    }

    const round = simulation.currentRound

    return (
        <>
            <p className="text-xs flex justify-center items-center">
                Round:<b>{round}</b>/{maxRounds}
            </p>
            <div
                className="relative h-2 bg-gray-400 mt-1 mb-1 cursor-pointer rounded"
                style={{ minWidth: timelineWidth }}
                onClick={handleSeek}
            >
                <div
                    className="absolute bottom-0 left-0 h-full bg-secondary rounded"
                    style={{ width: `${maxRounds ? (round / maxRounds) * 100 : 0}%` }}
                />
            </div>
        </>
    )
}

export default Timeline
