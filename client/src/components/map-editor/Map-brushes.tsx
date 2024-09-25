import { useAppContext } from '@/context'
import { EventType, listenEvent, dispatchEvent } from '@/events'
import { BrushType, Location, SpecialGridBrushTypes, Stack, StackContentBrushTypes, SurvivorInfo } from '@/utils/types'
import { useState } from 'react'
import NumberInput from '../inputs/NumberInput'

function MapBrushes() {
    const { appState } = useAppContext()
    const [brushType, setBrushType] = useState<BrushType>(BrushType.SpecialGrids)
    const [specialGridBrushTypes, setSpecialGridBrushTypes] = useState<SpecialGridBrushTypes>(
        SpecialGridBrushTypes.Killer
    )
    const [moveCost, setMoveCost] = useState<number>(2)
    const [gid, setGid] = useState<number>(0)
    const [stackType, setStackType] = useState<StackContentBrushTypes>(StackContentBrushTypes.Survivor)
    const [survivorInfo, setSurvivorInfo] = useState<SurvivorInfo>({
        energy_level: 0,
        body_mass: 0,
        mental_state: 0,
        damage_factor: 0
    })

    const applyBrush = (event: any) => {
        if (!appState.simulation) return

        const tile = event.detail.selectedCell as Location
        const rightClicked = event.detail.right
        const worldMap = appState.simulation.worldMap

        const { killerGrids, chargingGrids, fireGrids, stacks } = worldMap

        const isOccupied = (grid: { x: number; y: number }[]) => {
            return grid.some((g) => g.x === tile.x && g.y === tile.y)
        }
        const grid = stacks.find((g) => g.grid_loc.x === tile.x && g.grid_loc.y === tile.y)
        const isGridOccupied = isOccupied(killerGrids) || isOccupied(fireGrids) || isOccupied(chargingGrids)

        // Only allow one agent on the world
        const hasOneAgent = () => {
            let agentCount = 0

            for (const grid of stacks) {
                if (grid.contents) {
                    const agents = grid.contents.filter((item) => item.type === 'sv')
                    agentCount += agents.length
                }
            }
            return agentCount === 1
        }

        switch (brushType) {
            case BrushType.SpecialGrids:
                if (grid && grid.contents.length > 0) break
                handleSpecialGrids(isGridOccupied, rightClicked, tile)
                break
            case BrushType.MoveCost:
                handleMoveCost(grid, rightClicked)
                break
            case BrushType.StackContents:
                if (hasOneAgent() && !rightClicked) return
                handleStackContentBrush(isGridOccupied, rightClicked, grid)
                break
            case BrushType.Empty:
                break
            default:
                throw new Error(`Unknown BrushType: ${brushType}`)
        }
        dispatchEvent(EventType.RENDER_MAP, {})
    }

    listenEvent(EventType.TILE_CLICK, applyBrush)

    const handleSpecialGrids = (isGridOccupied: boolean, rightClicked: boolean, tile: Location) => {
        if (rightClicked) removeSpecialGrid(tile)
        else if (!isGridOccupied) addSpecialGrid(tile)
    }

    const removeSpecialGrid = (tile: Location) => {
        const { killerGrids, chargingGrids, fireGrids, spawnGrids } = appState.simulation!.worldMap
        switch (specialGridBrushTypes) {
            case SpecialGridBrushTypes.Killer:
                removeGrid(killerGrids, tile)
                break
            case SpecialGridBrushTypes.Fire:
                removeGrid(fireGrids, tile)
                break
            case SpecialGridBrushTypes.Charging:
                removeGrid(chargingGrids, tile)
                break
            case SpecialGridBrushTypes.Spawn:
                const key = JSON.stringify(tile) // Consistent key format
                if (spawnGrids.has(key)) spawnGrids.delete(key)
                break
            default:
                break
        }
    }

    const removeGrid = (grids: Location[], tile: Location) => {
        const index = grids.findIndex((g) => g.x === tile.x && g.y === tile.y)
        if (index !== -1) grids.splice(index, 1)
    }

    const addSpecialGrid = (tile: Location) => {
        const { killerGrids, chargingGrids, fireGrids } = appState.simulation!.worldMap
        switch (specialGridBrushTypes) {
            case SpecialGridBrushTypes.Killer:
                killerGrids.push(tile)
                break
            case SpecialGridBrushTypes.Fire:
                fireGrids.push(tile)
                break
            case SpecialGridBrushTypes.Charging:
                chargingGrids.push(tile)
                break
            case SpecialGridBrushTypes.Spawn:
                handleSpawnGrids(tile)
                break
        }
    }

    const handleSpawnGrids = (tile: Location) => {
        const { spawnGrids } = appState.simulation!.worldMap
        if (spawnGrids.size === 1) return
        const key = JSON.stringify(tile) // Consistent key format
        const existingGids = spawnGrids.get(key) || []

        if (gid === 0) {
            if (existingGids.length === 0) spawnGrids.set(key, [])
            return
        }
        if (!existingGids.includes(gid)) spawnGrids.set(key, [...existingGids, gid])
    }

    const handleMoveCost = (grid: Stack | undefined, rightClicked: boolean) => {
        if (grid) {
            if (rightClicked) grid.move_cost = 1
            else grid.move_cost = moveCost
        }
    }

    const handleStackContentBrush = (isGridOccupied: boolean, rightClicked: boolean, grid: Stack | undefined) => {
        if (grid) {
            if (rightClicked && grid.contents.length > 0) {
                grid.contents.pop()
                return
            }
            if (!isGridOccupied) addStackcontent(grid)
        }
    }

    const addStackcontent = (grid: Stack) => {
        switch (stackType) {
            case StackContentBrushTypes.Survivor:
                grid.contents.push({
                    type: 'sv',
                    arguments: survivorInfo
                })
                break
        }
    }

    return (
        <div className="flex flex-col">
            <select
                value={brushType}
                onChange={(e) => setBrushType(e.target.value as BrushType)}
                className="bg-white p-2 w-full border-2 border-gray-300 focus:border-accent-light rounded-md focus:outline-none"
            >
                <option value={BrushType.SpecialGrids}>Special Grids Brush</option>
                <option value={BrushType.MoveCost}>Move Cost Brush</option>
                <option value={BrushType.StackContents}>Stack Contents Brush</option>
                <option value={BrushType.Empty}>Empty Brush</option>
            </select>
            {brushType === BrushType.SpecialGrids && (
                <>
                    <select
                        value={specialGridBrushTypes}
                        onChange={(e) => setSpecialGridBrushTypes(e.target.value as SpecialGridBrushTypes)}
                        className="bg-white p-2 w-full border-2 border-gray-300 my-1 focus:border-accent-light rounded-md focus:outline-none"
                    >
                        <option value={SpecialGridBrushTypes.Killer}>Killer Brush</option>
                        <option value={SpecialGridBrushTypes.Fire}>Fire Brush</option>
                        <option value={SpecialGridBrushTypes.Charging}>Charging Brush</option>
                        <option value={SpecialGridBrushTypes.Spawn}>Spawn Brush</option>
                    </select>
                    {specialGridBrushTypes === SpecialGridBrushTypes.Spawn && (
                        <div className="flex mt-4 items-center justify-center">
                            <p className="mr-2">GID:</p>
                            <NumberInput value={gid} onChange={(newGid) => setGid(newGid)} min={0} extraStyles="w-16" />
                        </div>
                    )}
                </>
            )}
            {brushType === BrushType.MoveCost && (
                <>
                    <select
                        value={moveCost}
                        onChange={(e) => setMoveCost(parseInt(e.target.value))}
                        className="bg-white p-2 w-full border-2 border-gray-300 my-1 focus:border-accent-light rounded-md focus:outline-none"
                    >
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                        <option value={5}>5</option>
                    </select>
                    <div className="flex mt-4 items-center justify-center">
                        <p className="mr-2">Custom Move Cost:</p>
                        <NumberInput
                            value={moveCost}
                            onChange={(newCost) => setMoveCost(newCost)}
                            min={2}
                            extraStyles="w-16"
                        />
                    </div>
                </>
            )}
            {brushType === BrushType.StackContents && (
                <>
                    <select
                        value={stackType}
                        onChange={(e) => setStackType(e.target.value as StackContentBrushTypes)}
                        className="bg-white p-2 w-full border-2 border-gray-300 my-1 focus:border-accent-light rounded-md focus:outline-none"
                    >
                        <option value={StackContentBrushTypes.Survivor}>Survivor Brush</option>
                    </select>
                    {stackType === StackContentBrushTypes.Survivor && (
                        <div>
                            <div className="flex mt-4 items-center justify-center">
                                <p className="mr-2">Energy Level:</p>
                                <NumberInput
                                    value={survivorInfo.energy_level}
                                    onChange={(newEnergy) =>
                                        setSurvivorInfo({ ...survivorInfo, energy_level: newEnergy })
                                    }
                                    min={0}
                                    extraStyles="w-16"
                                />
                            </div>
                            <div className="flex mt-4 items-center justify-center">
                                <p className="mr-2">Body Mass:</p>
                                <NumberInput
                                    value={survivorInfo.body_mass}
                                    onChange={(newBodyMass) =>
                                        setSurvivorInfo({
                                            ...survivorInfo,
                                            body_mass: newBodyMass
                                        })
                                    }
                                    min={0}
                                    extraStyles="w-16"
                                />
                            </div>
                            <div className="flex mt-4 items-center justify-center">
                                <p className="mr-2">Damage Factor:</p>
                                <NumberInput
                                    value={survivorInfo.damage_factor}
                                    onChange={(newDamage) =>
                                        setSurvivorInfo({
                                            ...survivorInfo,
                                            damage_factor: newDamage
                                        })
                                    }
                                    min={0}
                                    extraStyles="w-16"
                                />
                            </div>
                            <div className="flex mt-4 items-center justify-center">
                                <p className="mr-2">Mental State:</p>
                                <NumberInput
                                    value={survivorInfo.mental_state}
                                    onChange={(newMental) =>
                                        setSurvivorInfo({
                                            ...survivorInfo,
                                            mental_state: newMental
                                        })
                                    }
                                    min={0}
                                    extraStyles="w-16"
                                />
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default MapBrushes
