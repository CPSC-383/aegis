import { useAppContext } from '@/context'
import { useState } from 'react'
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
import Dropdown from '../Dropdown'
import { motion } from 'framer-motion'

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
    }

    return (
        <div className="space-y-3 p-4 bg-gray-50 rounded-lg shadow-sm">
            <motion.h2
                className="text-lg font-semibold text-gray-800 flex items-center space-x-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <Brush className="w-6 h-6" />
                <span>Map Brushes</span>
            </motion.h2>
            <Dropdown
                items={brushTypeItems}
                selectedItem={brushType}
                onSelect={(item) => setBrushType(item as BrushType)}
            />
            {renderBrushContent()}
        </div>
    )
}

export default MapBrushes
