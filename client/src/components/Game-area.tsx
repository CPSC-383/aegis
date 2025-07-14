import { useEffect, useRef } from 'react'
import { useAppContext } from '@/contexts/AppContext'
import { EventType, dispatchEvent, listenEvent } from '@/events'
import { getImage, whatBucket } from '@/utils/util'
import { shadesOfBrown } from '@/types'

import layerSpriteSheetSrc from '@/assets/layers-spritesheet-Sheet.png'
import { drawAgent, renderCoords } from '@/utils/renderUtils'
import { Size } from '@/core/world'
import { AgentInfoDict } from '@/core/simulation'

function GameArea() {
    const { appState, setAppState } = useAppContext()
    const { simulation } = appState
    const worldCanvas = useRef<HTMLCanvasElement | null>(null)
    const agentCanvas = useRef<HTMLCanvasElement | null>(null)
    const stackCanvas = useRef<HTMLCanvasElement | null>(null)
    const worldContainerRef = useRef<HTMLDivElement | null>(null)
    const tileSize = 50
    const thickness = 0.04

    const updateCanvasSize = (canvas: HTMLCanvasElement | null, size: Size) => {
        if (!canvas) return
        canvas.width = size.width * tileSize
        canvas.height = size.height * tileSize
        canvas.getContext('2d')?.scale(tileSize, tileSize)
    }

    const renderAgents = () => {
        const ctx = agentCanvas.current?.getContext('2d')
        if (!ctx || !simulation || simulation.isGameOver()) return

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

        const cellMap = new Map<string, AgentInfoDict[]>()
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
            let [x, y] = key.split(',').map(Number)
            const coords = renderCoords(x, y, size)
            const agentsPerRow = 5
            const totalAgents = agentsInCell.length

            const agentSize = Math.max(tileSize / agentsPerRow / tileSize, tileSize / totalAgents / tileSize)

            agentsInCell.forEach((agent, i) => {
                const col = i % agentsPerRow
                const row = Math.floor(i / agentsPerRow)

                const drawX = coords.x + col * agentSize
                const drawY = coords.y + row * agentSize

                drawAgent(ctx, agent.agentId!.gid, drawX, drawY, agentSize)
            })
        })
    }

    const renderStack = () => {
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

                const cellLayers = simulation.getLayersAtCell(x, y)
                if (!cellLayers.length) continue
                const layer = cellLayers[cellLayers.length - 1]

                let rowInSheet = 0
                let colInSheet = 0

                if (layer.type.startsWith('rb')) {
                    const minMoveCost = simulation.worldMap.minMoveCost
                    const maxMoveCost = simulation.worldMap.maxMoveCost
                    const moveCost = simulation.getInfoAtCell(x, y).move_cost
                    // whichShade should be between 0 and shadesOfBrown.length i hope
                    const whichShade = whatBucket(minMoveCost, maxMoveCost, moveCost, shadesOfBrown.length)
                    rowInSheet = 1
                    colInSheet = whichShade
                } else if (layer.type.startsWith('svg')) {
                    rowInSheet = 5
                    colInSheet = 0
                } else if (layer.type.startsWith('sv')) {
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
                const numOfSurvivorsInCellLayers = Math.min(cellLayers.filter((layer) => layer.type === 'sv').length, 5)

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

    const handleWorldCanvasClick = (e: React.MouseEvent<HTMLDivElement>, right: boolean) => {
        const canvas = worldCanvas.current
        if (!canvas || !simulation) return

        const { width, height } = simulation.worldMap.size

        const rect = canvas.getBoundingClientRect()
        const x = Math.floor(((e.clientX - rect.left) / rect.width) * width)
        let y = Math.floor(((e.clientY - rect.top) / rect.height) * height)
        const coords = renderCoords(x, y, simulation.worldMap.size)

        if (coords.x < 0 || coords.x >= width || coords.y < 0 || coords.y >= height) return

        setAppState((prevState) => ({
            ...prevState,
            selectedCell: coords
        }))

        dispatchEvent(EventType.TILE_CLICK, { selectedCell: coords, right })
    }

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.button === 2) handleWorldCanvasClick(e, true)
    }

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.button === 0) handleWorldCanvasClick(e, false)
    }

    const renderMap = () => {
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

    listenEvent(EventType.RENDER_MAP, renderMap)

    if (!simulation) {
        return <div className="flex justify-center items-center">Waiting for simulation to start...</div>
    }

    return (
        <div
            ref={worldContainerRef}
            className="flex justify-center items-center relative w-full h-screen"
            onClick={handleClick}
            onMouseDown={handleMouseDown}
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
