import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppContext } from '@/context'
import { EventType, listenEvent } from '@/events'
import { useForceUpdate } from '@/utils/util'
import Timeline from './Timeline'
import { Play, Pause, SkipForward, SkipBack, Minimize2, Maximize2 } from 'lucide-react'

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

    const handleKeyPress = (e: KeyboardEvent) => {
        switch (e.key.toLowerCase()) {
            case ' ':
            case 'k':
                e.preventDefault()
                togglePlayPause(!simPaused)
                break
            case 'arrowleft':
            case 'j':
                handleRound(-1)
                break
            case 'arrowright':
            case 'l':
                handleRound(1)
                break
            case 'm':
                setIsMinimized((prev) => !prev)
                break
            default:
                break
        }
    }

    useEffect(() => {
        if (!simulation) return
        window.addEventListener('keydown', handleKeyPress)
        return () => {
            window.removeEventListener('keydown', handleKeyPress)
        }
    }, [simulation, simPaused])

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

    listenEvent(EventType.RENDER, useForceUpdate())

    // If maxRounds is -1, this means we are in the editor.
    // Don't show the control bar when there isnt a simulation as well.
    if (simulation?.maxRounds == -1 || !simulation) return null

    return (
        <AnimatePresence>
            {isMinimized ? (
                <motion.button
                    key="minimized-button"
                    initial={{ opacity: 0, scale: 0.5, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: 50 }}
                    transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 20
                    }}
                    onClick={() => setIsMinimized(false)}
                    className="fixed bottom-2 left-2 z-50 bg-white/90 p-2 rounded-full shadow-lg border border-gray-200 hover:bg-gray-100 transition-all duration-300 outline-none"
                >
                    <Maximize2 className="w-5 h-5" />
                </motion.button>
            ) : (
                <motion.div
                    key="full-controls"
                    initial={{ opacity: 0, scale: 0.5, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: 50 }}
                    transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 20
                    }}
                    className="fixed bottom-2 z-50"
                >
                    <div className="flex items-center bg-white/90 rounded-full shadow-lg border border-gray-200">
                        <button
                            onClick={() => setIsMinimized(true)}
                            className="p-2 pr-0 hover:bg-gray-100 rounded-full transition-colors flex items-center outline-none"
                        >
                            <Minimize2 className="w-5 h-5" />
                        </button>

                        <div className="mx-4">
                            <Timeline />
                        </div>

                        <div className="flex items-center space-x-1 pr-2">
                            <button
                                onClick={() => handleRound(-1)}
                                className="hover:bg-gray-100 rounded-full transition-colors cursor-pointer outline-none"
                                disabled={!simulation}
                            >
                                <SkipBack className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => togglePlayPause(!simPaused)}
                                className="hover:bg-gray-100 rounded-full transition-colors cursor-pointer outline-none"
                                disabled={!simulation}
                            >
                                {simPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                            </button>
                            <button
                                onClick={() => handleRound(1)}
                                className="hover:bg-gray-100 rounded-full transition-colors cursor-pointer outline-none"
                                disabled={!simulation}
                            >
                                <SkipForward className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default ControlsBar
