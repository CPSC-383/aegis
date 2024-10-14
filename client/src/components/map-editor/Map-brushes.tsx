import { useAppContext } from '@/context'
import { EventType, listenEvent, dispatchEvent } from '@/events'
import {
    BrushType,
    Location,
    RubbleInfo,
    SpecialCellBrushTypes,
    Stack,
    StackContentBrushTypes,
    SurvivorGroupInfo,
    SurvivorInfo
} from '@/utils/types'
import { useState } from 'react'
import NumberInput from '../inputs/NumberInput'

function MapBrushes() {
    const { appState } = useAppContext()
    const [brushType, setBrushType] = useState<BrushType>(BrushType.SpecialCells)
    const [specialCellBrushTypes, setSpecialCellBrushTypes] = useState<SpecialCellBrushTypes>(
        SpecialCellBrushTypes.Killer
    )
    const [moveCost, setMoveCost] = useState<number>(2)
    const [gid, setGid] = useState<number>(0)
    const [stackType, setStackType] = useState<StackContentBrushTypes>(StackContentBrushTypes.Survivor)
    const [rubbleInfo, setRubbleInfo] = useState<RubbleInfo>({ remove_energy: 0, remove_agents: 0 })
    const [survivorGroupInfo, setSurvivorGroupInfo] = useState<SurvivorGroupInfo>({
        energy_level: 0,
        number_of_survivors: 1
    })
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

        const { killerCells, chargingCells, fireCells, stacks } = worldMap

        const isOccupied = (cell: { x: number; y: number }[]) => {
            return cell.some((g) => g.x === tile.x && g.y === tile.y)
        }
        const cell = stacks.find((g) => g.cell_loc.x === tile.x && g.cell_loc.y === tile.y)
        const isCellOccupied = isOccupied(killerCells) || isOccupied(fireCells) || isOccupied(chargingCells)

        switch (brushType) {
            case BrushType.SpecialCells:
                if (cell && cell.contents.length > 0) break
                handleSpecialCells(isCellOccupied, rightClicked, tile)
                break
            case BrushType.MoveCost:
                handleMoveCost(cell, rightClicked)
                break
            case BrushType.StackContents:
                handleStackContentBrush(isCellOccupied, rightClicked, cell)
                break
            case BrushType.Empty:
                break
            default:
                throw new Error(`Unknown BrushType: ${brushType}`)
        }
        dispatchEvent(EventType.RENDER_MAP, {})
    }

    listenEvent(EventType.TILE_CLICK, applyBrush)

    const handleSpecialCells = (isCellOccupied: boolean, rightClicked: boolean, tile: Location) => {
        if (rightClicked) removeSpecialCell(tile)
        else if (!isCellOccupied) addSpecialCell(tile)
    }

    const removeSpecialCell = (tile: Location) => {
        const { killerCells, chargingCells, fireCells, spawnCells } = appState.simulation!.worldMap
        switch (specialCellBrushTypes) {
            case SpecialCellBrushTypes.Killer:
                removeCell(killerCells, tile)
                break
            case SpecialCellBrushTypes.Fire:
                removeCell(fireCells, tile)
                break
            case SpecialCellBrushTypes.Charging:
                removeCell(chargingCells, tile)
                break
            case SpecialCellBrushTypes.Spawn:
                const key = JSON.stringify(tile) // Consistent key format
                if (spawnCells.has(key)) spawnCells.delete(key)
                break
            default:
                break
        }
    }

    const removeCell = (cells: Location[], tile: Location) => {
        const index = cells.findIndex((g) => g.x === tile.x && g.y === tile.y)
        if (index !== -1) cells.splice(index, 1)
    }

    const addSpecialCell = (tile: Location) => {
        const { killerCells, chargingCells, fireCells } = appState.simulation!.worldMap
        switch (specialCellBrushTypes) {
            case SpecialCellBrushTypes.Killer:
                killerCells.push(tile)
                break
            case SpecialCellBrushTypes.Fire:
                fireCells.push(tile)
                break
            case SpecialCellBrushTypes.Charging:
                chargingCells.push(tile)
                break
            case SpecialCellBrushTypes.Spawn:
                handleSpawnCells(tile)
                break
        }
    }

    const handleSpawnCells = (tile: Location) => {
        const { spawnCells } = appState.simulation!.worldMap
        const key = JSON.stringify(tile) // Consistent key format
        const existingGids = spawnCells.get(key) || []

        if (gid === 0) {
            if (existingGids.length === 0) spawnCells.set(key, [])
            return
        }
        if (!existingGids.includes(gid)) spawnCells.set(key, [...existingGids, gid])
    }

    const handleMoveCost = (cell: Stack | undefined, rightClicked: boolean) => {
        if (cell) {
            if (rightClicked) cell.move_cost = 1
            else cell.move_cost = moveCost
        }
    }

    const handleStackContentBrush = (isCellOccupied: boolean, rightClicked: boolean, cell: Stack | undefined) => {
        if (cell) {
            if (rightClicked && cell.contents.length > 0) {
                cell.contents.pop()
                return
            }
            if (!isCellOccupied) addStackcontent(cell)
        }
    }

    const addStackcontent = (cell: Stack) => {
        switch (stackType) {
            case StackContentBrushTypes.Rubble:
                cell.contents.push({
                    type: 'rb',
                    arguments: rubbleInfo
                })
                break
            case StackContentBrushTypes.SurvivorGroup:
                cell.contents.push({
                    type: 'svg',
                    arguments: survivorGroupInfo
                })
                break
            case StackContentBrushTypes.Survivor:
                cell.contents.push({
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
                <option value={BrushType.SpecialCells}>Special Cells Brush</option>
                <option value={BrushType.MoveCost}>Move Cost Brush</option>
                <option value={BrushType.StackContents}>Stack Contents Brush</option>
                <option value={BrushType.Empty}>Empty Brush</option>
            </select>
            {brushType === BrushType.SpecialCells && (
                <>
                    <select
                        value={specialCellBrushTypes}
                        onChange={(e) => setSpecialCellBrushTypes(e.target.value as SpecialCellBrushTypes)}
                        className="bg-white p-2 w-full border-2 border-gray-300 my-1 focus:border-accent-light rounded-md focus:outline-none"
                    >
                        <option value={SpecialCellBrushTypes.Killer}>Killer Brush</option>
                        <option value={SpecialCellBrushTypes.Fire}>Fire Brush</option>
                        <option value={SpecialCellBrushTypes.Charging}>Charging Brush</option>
                        <option value={SpecialCellBrushTypes.Spawn}>Spawn Brush</option>
                    </select>
                    {specialCellBrushTypes === SpecialCellBrushTypes.Spawn && (
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
                        <option value={StackContentBrushTypes.SurvivorGroup}>Survivor Group Brush</option>
                        <option value={StackContentBrushTypes.Rubble}>Rubble Brush</option>
                    </select>
                    {stackType === StackContentBrushTypes.Rubble && (
                        <div>
                            <div className="flex mt-4 items-center justify-center">
                                <p className="mr-2">Remove Energy:</p>
                                <NumberInput
                                    value={rubbleInfo.remove_energy}
                                    onChange={(newEnergy) => setRubbleInfo({ ...rubbleInfo, remove_energy: newEnergy })}
                                    min={0}
                                    extraStyles="w-16"
                                />
                            </div>
                            <div className="flex mt-4 items-center justify-center">
                                <p className="mr-2">Remove Agents:</p>
                                <NumberInput
                                    value={rubbleInfo.remove_agents}
                                    onChange={(newAgents) => setRubbleInfo({ ...rubbleInfo, remove_agents: newAgents })}
                                    min={0}
                                    extraStyles="w-16"
                                />
                            </div>
                        </div>
                    )}
                    {stackType === StackContentBrushTypes.SurvivorGroup && (
                        <div>
                            <div className="flex mt-4 items-center justify-center">
                                <p className="mr-2">Energy Level:</p>
                                <NumberInput
                                    value={survivorGroupInfo.energy_level}
                                    onChange={(newEnergy) =>
                                        setSurvivorGroupInfo({ ...survivorGroupInfo, energy_level: newEnergy })
                                    }
                                    min={0}
                                    extraStyles="w-16"
                                />
                            </div>
                            <div className="flex mt-4 items-center justify-center">
                                <p className="mr-2">Number of Survivors:</p>
                                <NumberInput
                                    value={survivorGroupInfo.number_of_survivors}
                                    onChange={(newSurvivors) =>
                                        setSurvivorGroupInfo({
                                            ...survivorGroupInfo,
                                            number_of_survivors: newSurvivors
                                        })
                                    }
                                    min={1}
                                    extraStyles="w-16"
                                />
                            </div>
                        </div>
                    )}
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
