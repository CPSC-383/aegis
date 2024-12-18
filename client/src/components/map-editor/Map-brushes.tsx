import { useAppContext } from '@/context'
import { EventType, listenEvent, dispatchEvent } from '@/events'
import {
    BrushType,
    Location,
    RubbleInfo,
    SpecialCellBrushTypes,
    StackContentBrushTypes,
    SurvivorInfo,
    SpawnZoneTypes
} from '@/utils/types'
import { useCallback, useState } from 'react'
import SpecialCellsBrush from './brushes/components/SpecialCellsBrush'
import MoveCostBrush from './brushes/components/MoveCostBrush'
import StackContentBrush from './brushes/components/StackContentBrush'
import SpecialCellsHandler from './brushes/handlers/SpecialCellsHandler'
import MoveCostHandler from './brushes/handlers/MoveCostHandler'
import StackContentHandler from './brushes/handlers/StackContentHandler'
import { Brush, MousePointerClick, PlusSquare, Target, Zap } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDisplayText } from '@/utils/util'

function MapBrushes() {
    const { appState } = useAppContext()
    const [brushType, setBrushType] = useState<BrushType>(BrushType.SpecialCells)
    const [specialCellType, setSpecialCellType] = useState<SpecialCellBrushTypes>(SpecialCellBrushTypes.Killer)
    const [moveCost, setMoveCost] = useState<number>(2)
    const [gid, setGid] = useState<number>(0)
    const [spawnZoneType, setSpawnZoneType] = useState<SpawnZoneTypes>(SpawnZoneTypes.Any)
    const [stackType, setStackType] = useState<StackContentBrushTypes>(StackContentBrushTypes.Survivor)
    const [rubbleInfo, setRubbleInfo] = useState<RubbleInfo>({ remove_energy: 0, remove_agents: 0 })
    const [survivorInfo, _] = useState<SurvivorInfo>({
        energy_level: 0,
        body_mass: 0,
        mental_state: 0,
        damage_factor: 0
    })

    const createHandler = useCallback(
        (worldMap: any) => {
            switch (brushType) {
                case BrushType.SpecialCells:
                    return new SpecialCellsHandler(worldMap, specialCellType, spawnZoneType, gid)
                case BrushType.MoveCost:
                    return new MoveCostHandler(worldMap, moveCost)
                case BrushType.StackContents:
                    return new StackContentHandler(worldMap, stackType, rubbleInfo, survivorInfo)
                default:
                    return null
            }
        },
        [brushType, specialCellType, spawnZoneType, gid, moveCost, stackType, rubbleInfo, survivorInfo]
    )

    const handleBrush = useCallback(
        (event: any) => {
            if (!appState.simulation) return

            const handler = createHandler(appState.simulation.worldMap)
            if (!handler) return

            const tile = event.detail.selectedCell as Location
            const rightClicked = event.detail.right

            handler.handle(tile, rightClicked)
            dispatchEvent(EventType.RENDER_MAP, {})
        },
        [appState.simulation, createHandler]
    )

    listenEvent(EventType.TILE_CLICK, handleBrush)

    const brushTypeItems = Object.values(BrushType).map((type) => ({
        value: type,
        icon: {
            [BrushType.SpecialCells]: Target,
            [BrushType.MoveCost]: Zap,
            [BrushType.StackContents]: PlusSquare,
            [BrushType.View]: MousePointerClick
        }[type]
    }))

    const renderBrushContent = () => {
        switch (brushType) {
            case BrushType.SpecialCells:
                return (
                    <SpecialCellsBrush
                        specialCellType={specialCellType}
                        setSpecialCellType={setSpecialCellType}
                        spawnZoneType={spawnZoneType}
                        setSpawnZoneType={setSpawnZoneType}
                        gid={gid}
                        setGid={setGid}
                    />
                )
            case BrushType.MoveCost:
                return <MoveCostBrush moveCost={moveCost} setMoveCost={setMoveCost} />
            case BrushType.StackContents:
                return (
                    <StackContentBrush
                        stackType={stackType}
                        setStackType={setStackType}
                        rubbleInfo={rubbleInfo}
                        setRubbleInfo={setRubbleInfo}
                    />
                )
            default:
                return null
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

    // This only allows one spawn zone.
    const handleSpawnCells = (tile: Location) => {
        const { spawnCells } = appState.simulation!.worldMap
        if (spawnCells.size === 1) return
        const key = JSON.stringify(tile) // Consistent key format
        spawnCells.set(key, [0])
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
            case StackContentBrushTypes.Survivor:
                cell.contents.push({
                    type: 'sv',
                    arguments: survivorInfo
                })
                break
        }
    }

    const renderMoveCostSelect = () => {
        if (brushType !== BrushType.MoveCost) return null

        return (
            <Card className="w-full">
                <CardContent className="pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Move Cost</span>
                        <div className="flex space-x-2">
                            {[2, 3, 4, 5].map((cost) => (
                                <Button
                                    key={cost}
                                    variant={moveCost === cost ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setMoveCost(cost)}
                                >
                                    {cost}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">Custom:</span>
                        <Input
                            type="number"
                            value={moveCost === 0 ? '' : moveCost}
                            onChange={(e) => {
                                const value = e.target.value === '' ? 0 : Number(e.target.value)
                                setMoveCost(value)
                            }}
                            onBlur={(e) => {
                                let value = e.target.value === '' ? 0 : Number(e.target.value)

                                if (value < 2) value = 2

                                setMoveCost(value)
                            }}
                            className="w-20"
                        />
                    </div>
                </CardContent>
            </Card>
        )
    }

    const renderStackContentSelect = () => {
        if (brushType !== BrushType.StackContents) return null

        return (
            <Card className="w-full">
                <CardContent className="pt-4">
                    <div className="flex items-center">
                        <User className="w-5 h-5 text-muted-foreground" />
                        <span className="text-sm">Survivor</span>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <Brush className="w-5 h-5" />
                    <span>Map Brushes</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <Select value={brushType} onValueChange={(value) => setBrushType(value as BrushType)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select Brush Type" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.values(BrushType).map((type) => (
                            <SelectItem key={type} value={type}>
                                <div className="flex items-center space-x-2">
                                    {type === BrushType.SpecialCells && <Target className="w-4 h-4" />}
                                    {type === BrushType.MoveCost && <Zap className="w-4 h-4" />}
                                    {type === BrushType.StackContents && <PlusSquare className="w-4 h-4" />}
                                    {type === BrushType.View && <MousePointerClick className="w-4 h-4" />}
                                    <span>{formatDisplayText(type)}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {renderBrushContent()}
            </CardContent>
        </Card>
    )
}

export default MapBrushes
