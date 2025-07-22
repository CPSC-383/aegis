import { useAppContext } from '@/contexts/AppContext'
import { BrushType, shadesOfBrown } from '@/types'
import { getImage, whatBucket } from '@/utils/util'
import { useEffect, useRef, useState } from 'react'

import layerSpriteSheetSrc from '@/assets/layers-spritesheet-Sheet.png'
import { drawAgent, renderCoords } from '@/utils/renderUtils'
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


  // const renderStack = (): void => {
  //   const ctx = stackCanvas.current?.getContext('2d')
  //   const layerSpriteSheet = getImage(layerSpriteSheetSrc)
  //   if (!ctx || !game || !layerSpriteSheet) return
  //
  //   const size = game.world.size
  //   const { width, height } = size
  //   const spriteWidth = 32
  //   const spriteHeight = 32
  //
  //   for (let x = 0; x < width; x++) {
  //     for (let y = 0; y < height; y++) {
  //       const coords = renderCoords(x, y, size)
  //       ctx.clearRect(coords.x, coords.y, 1, 1)
  //
  //       // const layers = game.getLayersAtCell(x, y)
  //       // if (!layers.length) continue
  //       // const layer = layers[layers.length - 1]
  //
  //       let rowInSheet = 0
  //       let colInSheet = 0
  //
  //       // if (layer.object.oneofKind == "rubble") {
  //       //   const minMoveCost = game.world.minMoveCost
  //       //   const maxMoveCost = game.world.maxMoveCost
  //       //   const moveCost = game.getCell(x, y).moveCost
  //       //   // whichShade should be between 0 and shadesOfBrown.length i hope
  //       //   const whichShade = whatBucket(
  //       //     minMoveCost,
  //       //     maxMoveCost,
  //       //     moveCost,
  //       //     shadesOfBrown.length
  //       //   )
  //       //   rowInSheet = 1
  //       //   colInSheet = whichShade
  //       // } else if (layer.object.oneofKind == "survivor") {
  //       //   rowInSheet = 4
  //       //   colInSheet = 0
  //       // }
  //
  //       ctx.drawImage(
  //         layerSpriteSheet,
  //         colInSheet * spriteHeight,
  //         rowInSheet * spriteWidth,
  //         spriteWidth,
  //         spriteHeight,
  //         coords.x + thickness / 2,
  //         coords.y + thickness / 2,
  //         1 - thickness,
  //         1 - thickness
  //       )
  //
  //       // draw survivor sprites on edge of cell if there are any in the layer
  //       // const numOfSurvivorsInCellLayers = Math.min(
  //       //   layers.filter((layer) => layer.object.oneofKind === 'survivor').length,
  //       //   5
  //       // )
  //
  //       // draw survivor sprite onto cell
  //       // const survivorColumn = numOfSurvivorsInCellLayers - 1
  //       // const survivorRow = 2 // light blue squares are row 3 on spritesheet
  //       // ctx.drawImage(
  //       //   layerSpriteSheet,
  //       //   survivorColumn * spriteWidth,
  //       //   survivorRow * spriteHeight,
  //       //   spriteWidth,
  //       //   spriteHeight,
  //       //   coords.x + thickness / 2,
  //       //   coords.y + thickness / 2,
  //       //   1 - thickness,
  //       //   1 - thickness
  //       // )
  //     }
  //   }
  // }

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
      {!round && (
        <div>
          Waiting for simulation to start...
        </div>
      )}
    </div>
  )
}

export default GameArea
