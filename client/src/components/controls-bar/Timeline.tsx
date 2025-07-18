import { MouseEvent } from 'react'
import { useAppContext } from '@/contexts/AppContext'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Progress } from '@/components/ui/progress'

function Timeline() {
    const { appState } = useAppContext()
    const { simulation } = appState
    const maxRounds = simulation ? simulation.getMaxRounds() : 0
    const playableRounds = Math.max(0, maxRounds - 1)
    const TIMELINE_WIDTH = 300

    const handleSeek = (e: MouseEvent<HTMLDivElement>) => {
        if (!simulation) return

        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const round = Math.floor((x / TIMELINE_WIDTH) * (playableRounds + 1))
        const clampedRound = Math.max(0, Math.min(round, playableRounds))
        simulation.jumpToRound(clampedRound)
    }

    if (!simulation) {
        return (
            <div
                className="text-xs text-muted-foreground flex items-center justify-center"
                style={{ minWidth: TIMELINE_WIDTH }}
            >
                Waiting for simulation...
            </div>
        )
    }

    const round = simulation.getRoundNumber()
    const progressPercentage = playableRounds > 0 ? (round / playableRounds) * 100 : 0

    return (
        <TooltipProvider>
            <div className="w-full mx-auto space-y-1">
                <div className="flex justify-center items-center mb-1">
                    <span className="text-xs text-gray-600">Round:</span>
                    <span className="text-xs ml-1">
                        <b>{round}</b> / {playableRounds}
                    </span>
                </div>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div
                            className="relative cursor-pointer"
                            onClick={handleSeek}
                            style={{ minWidth: TIMELINE_WIDTH }}
                        >
                            <Progress value={progressPercentage} className="w-full h-2" />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Click to jump to a specific round</p>
                    </TooltipContent>
                </Tooltip>
            </div>
        </TooltipProvider>
    )
}

export default Timeline
