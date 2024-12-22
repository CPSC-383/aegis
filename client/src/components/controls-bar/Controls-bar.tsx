import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppContext } from '@/contexts/AppContext'
import { EventType, listenEvent } from '@/events'
import { useForceUpdate } from '@/utils/util'
import Timeline from './Timeline'
import { Play, Pause, SkipForward, SkipBack, Minimize2, Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

function ControlsBar() {
    const ROUND_INTERVAL_DURATION = 200
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
        simulation.jumpToRound(simulation.getRoundNumber() + step)
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
        }, ROUND_INTERVAL_DURATION)
        return () => {
            clearInterval(roundInterval)
        }
    }, [simulation, simPaused])

    listenEvent(EventType.RENDER, useForceUpdate())

    // If maxRounds is -1, this means we are in the editor.
    // Don't show the control bar when there isn't a simulation as well.
    if (!simulation || simulation.getMaxRounds() == -1) return null

    return (
        <TooltipProvider>
            <AnimatePresence>
                {isMinimized ? (
                    <motion.div
                        key="minimized-button"
                        initial={{ opacity: 0, scale: 0.5, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.5, y: 50 }}
                        transition={{
                            type: 'spring',
                            stiffness: 300,
                            damping: 20
                        }}
                        className="fixed bottom-2 left-2 z-50"
                    >
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" onClick={() => setIsMinimized(false)}>
                                    <Maximize2 className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Expand Controls</p>
                            </TooltipContent>
                        </Tooltip>
                    </motion.div>
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
                        <div className="flex items-center bg-white/90 rounded-full shadow-lg border border-gray-200 p-1">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={() => setIsMinimized(true)}>
                                        <Minimize2 className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Minimize Controls</p>
                                </TooltipContent>
                            </Tooltip>

                            <div className="mx-2">
                                <Timeline />
                            </div>

                            <div className="flex items-center pr-1">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRound(-1)}
                                            disabled={!simulation}
                                        >
                                            <SkipBack className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Previous Round</p>
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => togglePlayPause(!simPaused)}
                                            disabled={!simulation}
                                        >
                                            {simPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{simPaused ? 'Play' : 'Pause'}</p>
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRound(1)}
                                            disabled={!simulation}
                                        >
                                            <SkipForward className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Next Round</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </TooltipProvider>
    )
}

export default ControlsBar
