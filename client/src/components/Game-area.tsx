import { useEffect, useRef } from "react"
import { Renderer } from "@/core/Renderer"
import useRound from "@/hooks/useRound"
import useHover from "@/hooks/useHover"

export default function GameArea(): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const hoveredTile = useHover()
  const round = useRound()

  useEffect(() => {
    if (round && containerRef.current) {
      Renderer.renderToContainer(containerRef.current)
    }
  }, [round])

  return (
    <div className="relative flex justify-center items-center w-full h-screen">
      {round ? (
        <>
          <div ref={containerRef} className="absolute inset-0" />
          {hoveredTile && (
            <div className="absolute top-1 left-1 z-50 bg-black/70 text-white p-2 rounded-lg pointer-events-none text-sm font-semibold">
              {`(X: ${hoveredTile.x}, Y: ${hoveredTile.y})`}
            </div>
          )}
        </>
      ) : (
        <div className="text-muted-foreground">Waiting for game to start...</div>
      )}
    </div>
  )
}
