import { useAppContext } from '@/contexts/AppContext'
import { EventType, dispatchEvent, listenEvent } from '@/events'
import { BrushType, shadesOfBrown } from '@/types'
import { getImage, whatBucket } from '@/utils/util'
import { useEffect, useRef, useState } from 'react'

import layerSpriteSheetSrc from '@/assets/layers-spritesheet-Sheet.png'
import { Size } from '@/core/world'
import { drawAgent, renderCoords } from '@/utils/renderUtils'

function GameArea(): JSX.Element {
  const { appState, setAppState } = useAppContext()
  // Determine which simulation and selectedCell to use
  const isEditor = Boolean(appState.editorSimulation)
  const simulation = isEditor ? appState.editorSimulation : appState.simulation
  const worldCanvas = useRef<HTMLCanvasElement | null>(null)
  const agentCanvas = useRef<HTMLCanvasElement | null>(null)
  const stackCanvas = useRef<HTMLCanvasElement | null>(null)
  const worldContainerRef = useRef<HTMLDivElement | null>(null)
  const tileSize = 50
  const thickness = 0.04

  // Drag state
  const [isDragging, setIsDragging] = useState(false)
  const [dragButton, setDragButton] = useState<number | null>(null)

  const updateCanvasSize = (canvas: HTMLCanvasElement | null, size: Size): void => {
    if (!canvas) return
    canvas.width = size.width * tileSize
    canvas.height = size.height * tileSize
    canvas.getContext('2d')?.scale(tileSize, tileSize)
  }

  const renderAgents = (): void => {
    const ctx = agentCanvas.current?.getContext('2d')
    if (!ctx || !simulation || simulation.isGameOver()) return

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    const cellMap = new Map<string, number[]>()
    const size = simulation.worldMap.size

    for (let x = 0; x < size.width; x++) {
      for (let y = 0; y < size.height; y++) {
        const agentsInCell = simulation.getAgentsAtCell(x, y)
        if (agentsInCell.length > 0) {
          cellMap.set(`${x},${y}`, agentsInCell)
        }
      }
    }

    cellMap.forEach((agentsInCell, key) => {
      const [x, y] = key.split(',').map(Number)
      const coords = renderCoords(x, y, size)
      const agentsPerRow = 5
      const totalAgents = agentsInCell.length

      const agentSize = Math.max(
        tileSize / agentsPerRow / tileSize,
        tileSize / totalAgents / tileSize
      )

      agentsInCell.forEach((agent, i) => {
        const col = i % agentsPerRow
        const row = Math.floor(i / agentsPerRow)

        const drawX = coords.x + col * agentSize
        const drawY = coords.y + row * agentSize

        drawAgent(ctx, 1, drawX, drawY, agentSize)
      })
    })
  }

  const renderStack = (): void => {
    const ctx = stackCanvas.current?.getContext('2d')
    const layerSpriteSheet = getImage(layerSpriteSheetSrc)
    if (!ctx || !simulation || !layerSpriteSheet) return

    const size = simulation.worldMap.size
    const { width, height } = size
    const spriteWidth = 32
    const spriteHeight = 32

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const coords = renderCoords(x, y, size)
        ctx.clearRect(coords.x, coords.y, 1, 1)

        const layers = simulation.getLayersAtCell(x, y)
        if (!layers.length) continue
        const layer = layers[layers.length - 1]

        let rowInSheet = 0
        let colInSheet = 0

        if (layer.object.oneofKind == "rubble") {
          const minMoveCost = simulation.worldMap.minMoveCost
          const maxMoveCost = simulation.worldMap.maxMoveCost
          const moveCost = simulation.getCell(x, y).moveCost
          // whichShade should be between 0 and shadesOfBrown.length i hope
          const whichShade = whatBucket(
            minMoveCost,
            maxMoveCost,
            moveCost,
            shadesOfBrown.length
          )
          rowInSheet = 1
          colInSheet = whichShade
        } else if (layer.object.oneofKind == "survivor") {
          rowInSheet = 4
          colInSheet = 0
        }

        ctx.drawImage(
          layerSpriteSheet,
          colInSheet * spriteHeight,
          rowInSheet * spriteWidth,
          spriteWidth,
          spriteHeight,
          coords.x + thickness / 2,
          coords.y + thickness / 2,
          1 - thickness,
          1 - thickness
        )

        // draw survivor sprites on edge of cell if there are any in the layer
        const numOfSurvivorsInCellLayers = Math.min(
          layers.filter((layer) => layer.object.oneofKind === 'survivor').length,
          5
        )

        // draw survivor sprite onto cell
        const survivorColumn = numOfSurvivorsInCellLayers - 1
        const survivorRow = 2 // light blue squares are row 3 on spritesheet
        ctx.drawImage(
          layerSpriteSheet,
          survivorColumn * spriteWidth,
          survivorRow * spriteHeight,
          spriteWidth,
          spriteHeight,
          coords.x + thickness / 2,
          coords.y + thickness / 2,
          1 - thickness,
          1 - thickness
        )
      }
    }
  }

  listenEvent(EventType.RENDER, renderAgents)
  listenEvent(EventType.RENDER_STACK, renderStack)

  const handleWorldCanvasClick = (
    e: React.MouseEvent<HTMLDivElement>,
    right: boolean
  ): void => {
    const canvas = worldCanvas.current
    if (!canvas || !simulation) return

    const { width, height } = simulation.worldMap.size

    const rect = canvas.getBoundingClientRect()
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * width)
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * height)
    const coords = renderCoords(x, y, simulation.worldMap.size)

    if (coords.x < 0 || coords.x >= width || coords.y < 0 || coords.y >= height) return

    setAppState((prevState) => ({
      ...prevState,
      ...(isEditor ? { editorSelectedCell: coords } : { selectedCell: coords })
    }))

    dispatchEvent(EventType.TILE_CLICK, { selectedCell: coords, right })
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>): void => {
    // Disable dragging for cell contents brush
    if (isEditor && appState.currentBrushType === BrushType.CellContents) {
      if (e.button === 2) {
        handleWorldCanvasClick(e, true)
      } else if (e.button === 0) {
        handleWorldCanvasClick(e, false)
      }
    } else if (e.button === 2) {
      handleWorldCanvasClick(e, true)
      setIsDragging(true)
      setDragButton(2)
    } else if (e.button === 0) {
      setIsDragging(true)
      setDragButton(0)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>): void => {
    // Disable dragging for cell contents brush
    if (isEditor && appState.currentBrushType === BrushType.CellContents) {
      return
    }

    if (!isDragging || dragButton === null) return

    const isRightClick = dragButton === 2
    handleWorldCanvasClick(e, isRightClick)
  }

  const handleMouseUp = (): void => {
    setIsDragging(false)
    setDragButton(null)
  }

  const renderMap = (): void => {
    if (!simulation) return
    const worldCanvasElem = worldCanvas.current
    const agentCanvasElem = agentCanvas.current
    const stackCanvasElem = stackCanvas.current
    if (!worldCanvasElem || !agentCanvasElem || !stackCanvasElem) return

    const ctx = worldCanvasElem.getContext('2d')
    const actx = agentCanvasElem.getContext('2d')
    const sctx = stackCanvasElem.getContext('2d')
    if (!ctx || !actx || !sctx) return

    // Clear everything everytime we start a new simulation
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    actx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    sctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    const size = simulation.worldMap.size

    updateCanvasSize(worldCanvasElem, size)
    updateCanvasSize(agentCanvasElem, size)
    updateCanvasSize(stackCanvasElem, size)

    simulation.worldMap.draw(ctx)
    renderStack()
  }

  useEffect(() => {
    renderMap()
  }, [simulation])

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

  // Render map and agents when switching away from map editor
  useEffect(() => {
    if (!isEditor && simulation) {
      renderMap()
      renderAgents()
    }
  }, [isEditor, simulation])

  listenEvent(EventType.RENDER_MAP, renderMap)

  if (!simulation) {
    return (
      <div className="flex justify-center items-center">
        Waiting for simulation to start...
      </div>
    )
  }

  return (
    <div
      ref={worldContainerRef}
      className="flex justify-center items-center relative w-full h-screen"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div>
        <canvas
          className="absolute top-1/2 left-1/2 max-w-full max-h-full z-0 -translate-x-1/2 -translate-y-1/2"
          ref={worldCanvas}
        />
        <canvas
          className="absolute top-1/2 left-1/2 max-w-full max-h-full z-10 -translate-x-1/2 -translate-y-1/2"
          ref={stackCanvas}
        />
        <canvas
          className="absolute top-1/2 left-1/2 max-w-full max-h-full z-20 -translate-x-1/2 -translate-y-1/2"
          ref={agentCanvas}
        />
      </div>
    </div>
  )
}

export default GameArea
