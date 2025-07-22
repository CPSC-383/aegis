import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { useAppContext } from '@/contexts/AppContext'
import { EventType, listenEvent } from '@/events'
import { useForceUpdate } from '@/utils/util'
import { AnimatePresence, motion } from 'framer-motion'
import { Maximize2, Minimize2, Pause, Play, SkipBack, SkipForward } from 'lucide-react'
import { useEffect, useState } from 'react'
import Timeline from './Timeline'

const ControlsBar = (): JSX.Element => {
  const ROUND_INTERVAL_DURATION = 200
  const { appState, setAppState } = useAppContext()
  const { game, simPaused } = appState
  const [isMinimized, setIsMinimized] = useState<boolean>(false)

  const togglePlayPause = (paused: boolean): void => {
    if (!game) return
    setAppState((prevState) => ({
      ...prevState,
      simPaused: paused
    }))
  }

  const handleRound = (step: number): void => {
    if (!game) return

    const currentRound = game.currentRound.round
    const maxRounds = game.maxRound
    const newRound = currentRound + step

    // Check bounds before jumping
    if (newRound >= 0 && newRound <= maxRounds) {
      // game.jumpToRound(newRound)
    }
  }

  const handleKeyPress = (e: KeyboardEvent): void => {
    switch (e.key.toLowerCase()) {
      case ' ':
        e.preventDefault()
        togglePlayPause(!simPaused)
        break
      case 'arrowleft':
        handleRound(-1)
        break
      case 'arrowright':
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
    if (!game) return
    window.addEventListener('keydown', handleKeyPress)
    return (): void => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [game, simPaused])

  useEffect(() => {
    if (!game || simPaused) return
    const roundInterval = setInterval(() => {
      // game.renderNextRound()
      if (game.currentRound.isEnd()) {
        togglePlayPause(true)
      }
    }, ROUND_INTERVAL_DURATION)
    return (): void => {
      clearInterval(roundInterval)
    }
  }, [game, simPaused])

  listenEvent(EventType.RENDER, useForceUpdate())

  // If maxRounds is -1, this means we are in the editor.
  // Don't show the control bar when there isn't a simulation as well.
  if (!game || game.maxRound === -1) return <></>

  const currentRound = game.currentRound.round
  const maxRounds = game.maxRound
  const canGoBack = currentRound > 0
  const canGoForward = currentRound < maxRounds

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
                <Button
                  variant="outline"
                  size="icon"
                  onClick={(): void => setIsMinimized(false)}
                >
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
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(): void => setIsMinimized(true)}
                  >
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
                      onClick={(): void => handleRound(-1)}
                      disabled={!game || !canGoBack}
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
                      onClick={(): void => togglePlayPause(!simPaused)}
                      disabled={!game}
                    >
                      {simPaused ? (
                        <Play className="h-4 w-4" />
                      ) : (
                        <Pause className="h-4 w-4" />
                      )}
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
                      onClick={(): void => handleRound(1)}
                      disabled={!game || !canGoForward}
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
