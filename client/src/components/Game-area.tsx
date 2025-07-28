import { useEffect, useRef } from 'react'
import { Renderer } from '@/core/Renderer'
import useRound from '@/hooks/useRound'

export default function GameArea(): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const round = useRound()

  useEffect(() => {
    if (round && containerRef.current) {
      Renderer.renderToContainer(containerRef.current)
    }
  }, [round])

  return (
    <div className="relative flex justify-center items-center w-full h-screen">
      {round ? (
        <div ref={containerRef} className="absolute inset-0" />
      ) : (
        <div className="text-muted-foreground">Waiting for game to start...</div>
      )}
    </div>
  )
}
