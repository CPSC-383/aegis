import { useEffect, useRef } from 'react'

import { Renderer } from '@/core/Renderer'
import useRound from '@/hooks/useRound'

function GameArea(): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const round = useRound()

  // Render canvases after mount
  useEffect(() => {
    if (containerRef.current) {
      Renderer.renderToContainer(containerRef.current)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative flex justify-center items-center w-full h-screen"
    >
      {!round && <div>Waiting for simulation to start...</div>}
    </div>
  )
}

export default GameArea
