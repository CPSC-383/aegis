import { BrushType, shadesOfBrown } from '@/types'
import { useEffect, useRef, useState } from 'react'

import { renderCoords } from '@/utils/renderUtils'
import { Renderer } from '@/core/Renderer'
import useRound from '@/hooks/useRound'

function GameArea(): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const round = useRound()

  // Drag state
  const [isDragging, setIsDragging] = useState(false)
  const [dragButton, setDragButton] = useState<number | null>(null)

  // Render canvases after mount
  useEffect(() => {
    if (containerRef.current) {
      Renderer.renderToContainer(containerRef.current)
    }
  }, [])

  // const handleWorldCanvasClick = (
  //   e: React.MouseEvent<HTMLDivElement>,
  //   right: boolean
  // ): void => {
  //   const canvas = worldCanvas.current
  //   if (!canvas || !game) return
  //
  //   const size = game.world.size
  //
  //   const rect = canvas.getBoundingClientRect()
  //   const x = Math.floor(((e.clientX - rect.left) / rect.width) * size.width)
  //   const y = Math.floor(((e.clientY - rect.top) / rect.height) * size.height)
  //   const coords = renderCoords(x, y, size)
  //
  //   if (coords.x < 0 || coords.x >= size.width || coords.y < 0 || coords.y >= size.height) return
  //
  //   setAppState((prevState) => ({
  //     ...prevState,
  //     ...(isEditor ? { editorSelectedCell: coords } : { selectedCell: coords })
  //   }))
  //
  //   dispatchEvent(EventType.TILE_CLICK, { selectedCell: coords, right })
  // }
  //
  // const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>): void => {
  //   // Disable dragging for cell contents brush
  //   if (isEditor && appState.currentBrushType === BrushType.CellContents) {
  //     if (e.button === 2) {
  //       handleWorldCanvasClick(e, true)
  //     } else if (e.button === 0) {
  //       handleWorldCanvasClick(e, false)
  //     }
  //   } else if (e.button === 2) {
  //     handleWorldCanvasClick(e, true)
  //     setIsDragging(true)
  //     setDragButton(2)
  //   } else if (e.button === 0) {
  //     setIsDragging(true)
  //     setDragButton(0)
  //   }
  // }

  // const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>): void => {
  //   // Disable dragging for cell contents brush
  //   if (isEditor && appState.currentBrushType === BrushType.CellContents) {
  //     return
  //   }
  //
  //   if (!isDragging || dragButton === null) return
  //
  //   const isRightClick = dragButton === 2
  //   handleWorldCanvasClick(e, isRightClick)
  // }

  const handleMouseUp = (): void => {
    setIsDragging(false)
    setDragButton(null)
  }

  // Handle global mouse up to stop dragging when mouse is released outside container
  useEffect(() => {
    const handleGlobalMouseUp = (): void => {
      setIsDragging(false)
      setDragButton(null)
    }

    document.addEventListener('mouseup', handleGlobalMouseUp)
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative flex justify-center items-center w-full h-screen"
      // onMouseDown={handleMouseDown}
      // onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {!round && <div>Waiting for simulation to start...</div>}
    </div>
  )
}

export default GameArea
