import { useAppContext } from '@/context'
import { useEffect, useState } from 'react'
import { EventType, listenEvent } from '@/events'
import { useForceUpdate } from '@/utils/util'
import Timeline from './Timeline'

import PauseIcon from '@/assets/pause.svg'
import PlayIcon from '@/assets/play.svg'
import NextIcon from '@/assets/next.svg'
import PrevIcon from '@/assets/prev.svg'
import MinimizeIcon from '@/assets/minimize.svg'

function ControlsBar() {
    const roundIntervalDuration = 200
    const { appState, setAppState } = useAppContext()
    const { simulation, simPaused } = appState

    const [isMinimized, setIsMinimized] = useState<boolean>(false)

    const togglePlayPause = (paused: boolean) => {
        if (!simulation) return
        setAppState((prevState) => ({
            ...prevState,
            simPaused: paused
        }))
    }

    const handleRound = (step: number) => {
        if (!simulation) return
        simulation.jumpToRound(simulation.currentRound + step)
    }

    useEffect(() => {
        if (!simulation || simPaused) return

        const roundInterval = setInterval(() => {
            simulation.renderNextRound()

            if (simulation.isGameOver()) {
                togglePlayPause(true)
            }
        }, roundIntervalDuration)

        return () => {
            clearInterval(roundInterval)
        }
    }, [simulation, simPaused])

    const simPlayPauseIcon = !simPaused ? PauseIcon : PlayIcon

    listenEvent(EventType.RENDER, useForceUpdate())

    return (
        <div className="absolute bottom-0 z-50">
            <div
                className={`relative flex items-center gap-2 bg-white p-0.5 ${isMinimized ? 'opacity-50' : 'bg-opacity-90'}`}
            >
                <button onClick={() => setIsMinimized(!isMinimized)} className="cursor-pointer">
                    <img src={MinimizeIcon} alt="Toggle Minimize" />
                </button>
                <Timeline />
                <div className="flex items-center justify-center">
                    <button onClick={() => handleRound(-1)} className="cursor-pointer">
                        <img src={PrevIcon} alt="Previous Round" />
                    </button>
                    <button onClick={() => togglePlayPause(!simPaused)} className="cursor-pointer">
                        <img src={simPlayPauseIcon} alt={simPaused ? 'Play' : 'Pause'} />
                    </button>
                    <button onClick={() => handleRound(1)} className="cursor-pointer">
                        <img src={NextIcon} alt="Next Round" />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ControlsBar
