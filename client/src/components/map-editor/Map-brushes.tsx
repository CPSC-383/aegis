import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useAppContext } from '@/contexts/AppContext'
import {
  Location,
  RubbleInfo,
  SpawnZoneTypes,
  SurvivorInfo,
  WorldMap
} from '@/core/world'
import { dispatchEvent, EventType, listenEvent } from '@/events'
import { BrushType, CellContentBrushTypes, SpecialCellBrushTypes } from '@/types'
import { formatDisplayText } from '@/utils/util'
import { Brush, MousePointerClick, PlusSquare, Target, Zap } from 'lucide-react'
import { useCallback, useState } from 'react'
import MoveCostBrush from './brushes/components/MoveCostBrush'
import SpecialCellsBrush from './brushes/components/SpecialCellsBrush'
import StackContentBrush from './brushes/components/StackContentBrush'
import BrushHandler from './brushes/handlers/BrushHandler'
import MoveCostHandler from './brushes/handlers/MoveCostHandler'
import SpecialCellsHandler from './brushes/handlers/SpecialCellsHandler'
import StackContentHandler from './brushes/handlers/StackContentHandler'

function MapBrushes(): JSX.Element {
  const { appState } = useAppContext()
  const [brushType, setBrushType] = useState<BrushType>(BrushType.SpecialCells)
  const [specialCellType, setSpecialCellType] = useState<SpecialCellBrushTypes>(
    SpecialCellBrushTypes.Killer
  )
  const [moveCost, setMoveCost] = useState<number>(2)
  const [gid, setGid] = useState<number>(0)
  const [spawnZoneType, setSpawnZoneType] = useState<SpawnZoneTypes>(SpawnZoneTypes.Any)
  const [stackType, setStackType] = useState<CellContentBrushTypes>(
    CellContentBrushTypes.Survivor
  )
  const [rubbleInfo, setRubbleInfo] = useState<RubbleInfo>({
    energy_required: 0,
    agents_required: 0
  })
  const [survivorInfo] = useState<SurvivorInfo>({
    energy_level: 100
  })

  const createHandler = useCallback(
    (worldMap: WorldMap): BrushHandler | null => {
      switch (brushType) {
        case BrushType.SpecialCells:
          return new SpecialCellsHandler(worldMap, specialCellType, spawnZoneType, gid)
        case BrushType.MoveCost:
          return new MoveCostHandler(worldMap, moveCost)
        case BrushType.CellContents:
          return new StackContentHandler(worldMap, stackType, rubbleInfo, survivorInfo)
        default:
          return null
      }
    },
    [
      brushType,
      specialCellType,
      spawnZoneType,
      gid,
      moveCost,
      stackType,
      rubbleInfo,
      survivorInfo
    ]
  )

  const handleBrush = useCallback(
    (event: CustomEvent<{ selectedCell: Location; right: boolean }>): void => {
      if (!appState.editorSimulation) return

      const handler = createHandler(appState.editorSimulation.worldMap)
      if (!handler) return

      const tile = event.detail.selectedCell as Location
      const rightClicked = event.detail.right

      handler.handle(tile, rightClicked)
      dispatchEvent(EventType.RENDER_MAP, {})
    },
    [appState.editorSimulation, createHandler]
  )

  listenEvent(EventType.TILE_CLICK, handleBrush)

  const renderBrushContent = (): JSX.Element | null => {
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
      case BrushType.CellContents:
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brush className="w-5 h-5" />
          <span>Map Brushes</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Select
          value={brushType}
          onValueChange={(value: string): void => setBrushType(value as BrushType)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Brush Type" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(BrushType).map((type) => (
              <SelectItem key={type} value={type}>
                <div className="flex items-center space-x-2">
                  {type === BrushType.SpecialCells && <Target className="w-4 h-4" />}
                  {type === BrushType.MoveCost && <Zap className="w-4 h-4" />}
                  {type === BrushType.CellContents && (
                    <PlusSquare className="w-4 h-4" />
                  )}
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
