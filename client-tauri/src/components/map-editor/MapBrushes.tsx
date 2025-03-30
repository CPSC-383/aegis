import { useAppContext } from "@/contexts/AppContext";
import { EventType, listenEvent, dispatchEvent } from "@/events";
import {
  BrushType,
  SpecialCellBrushTypes,
  StackContentBrushTypes,
} from "@/types";
import { useCallback, useState } from "react";
import SpecialCellsBrush from "./brushes/components/SpecialCellsBrush";
import MoveCostBrush from "./brushes/components/MoveCostBrush";
import StackContentBrush from "./brushes/components/StackContentBrush";
import SpecialCellsHandler from "./brushes/handlers/special-cells-handler";
import MoveCostHandler from "./brushes/handlers/move-cost-handler";
import StackContentHandler from "./brushes/handlers/stack-content-brush";
import {
  Brush,
  MousePointerClick,
  PlusSquare,
  Target,
  Zap,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDisplayText } from "@/utils/utils";
import {
  RubbleInfo,
  SpawnZoneTypes,
  SurvivorInfo,
  Location,
} from "@/core/world";

function MapBrushes() {
  const { appState } = useAppContext();
  const [brushType, setBrushType] = useState<BrushType>(BrushType.SpecialCells);
  const [specialCellType, setSpecialCellType] = useState<SpecialCellBrushTypes>(
    SpecialCellBrushTypes.Killer,
  );
  const [moveCost, setMoveCost] = useState<number>(2);
  const [gid, setGid] = useState<number>(0);
  const [spawnZoneType, setSpawnZoneType] = useState<SpawnZoneTypes>(
    SpawnZoneTypes.Any,
  );
  const [stackType, setStackType] = useState<StackContentBrushTypes>(
    StackContentBrushTypes.Survivor,
  );
  const [rubbleInfo, setRubbleInfo] = useState<RubbleInfo>({
    remove_energy: 0,
    remove_agents: 0,
  });
  const [survivorInfo, _] = useState<SurvivorInfo>({
    energy_level: 100,
    body_mass: 0,
    mental_state: 0,
    damage_factor: 0,
  });

  const createHandler = useCallback(
    (worldMap: any) => {
      switch (brushType) {
        case BrushType.SpecialCells:
          return new SpecialCellsHandler(
            worldMap,
            specialCellType,
            spawnZoneType,
            gid,
          );
        case BrushType.MoveCost:
          return new MoveCostHandler(worldMap, moveCost);
        case BrushType.StackContents:
          return new StackContentHandler(
            worldMap,
            stackType,
            rubbleInfo,
            survivorInfo,
          );
        default:
          return null;
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
      survivorInfo,
    ],
  );

  const handleBrush = useCallback(
    (event: any) => {
      if (!appState.simulation) return;

      const handler = createHandler(appState.simulation.worldMap);
      if (!handler) return;

      const tile = event.detail.selectedCell as Location;
      const rightClicked = event.detail.right;

      handler.handle(tile, rightClicked);
      dispatchEvent(EventType.RENDER_MAP, {});
    },
    [appState.simulation, createHandler],
  );

  listenEvent(EventType.TILE_CLICK, handleBrush);

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
        );
      case BrushType.MoveCost:
        return <MoveCostBrush moveCost={moveCost} setMoveCost={setMoveCost} />;
      case BrushType.StackContents:
        return (
          <StackContentBrush
            stackType={stackType}
            setStackType={setStackType}
            rubbleInfo={rubbleInfo}
            setRubbleInfo={setRubbleInfo}
          />
        );
      default:
        return null;
    }
  };

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
          onValueChange={(value) => setBrushType(value as BrushType)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Brush Type" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(BrushType).map((type) => (
              <SelectItem key={type} value={type}>
                <div className="flex items-center space-x-2">
                  {type === BrushType.SpecialCells && (
                    <Target className="w-4 h-4" />
                  )}
                  {type === BrushType.MoveCost && <Zap className="w-4 h-4" />}
                  {type === BrushType.StackContents && (
                    <PlusSquare className="w-4 h-4" />
                  )}
                  {type === BrushType.View && (
                    <MousePointerClick className="w-4 h-4" />
                  )}
                  <span>{formatDisplayText(type)}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {renderBrushContent()}
      </CardContent>
    </Card>
  );
}

export default MapBrushes;
