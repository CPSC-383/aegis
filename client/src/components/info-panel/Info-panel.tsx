import useCanvas from "@/hooks/useCanvas"
import { useEffect, useRef } from "react"
import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper"
import useRound from "@/hooks/useRound"
import { schema } from "aegis-schema"
import World from "@/core/World"
import useGames from "@/hooks/useGames"

export default function InfoPanel(): JSX.Element | null {
  const { selectedTile } = useCanvas()
  const round = useRound()
  const games = useGames()
  const initialWorldRef = useRef<World | null>(null)

  const currentWorld = round?.world.copy() ?? null
  const initialWorld = initialWorldRef.current

  useEffect(() => {
    if (round && !initialWorldRef.current) {
      initialWorldRef.current = round.game.world.copy()
    }
  }, [round])

  if (!round || !games?.playable) {
    return null
  }
  if (!selectedTile) {
    return <div>Select a cell to look at</div>
  }

  const currentLayers = currentWorld
    ? currentWorld.cellAt(selectedTile.x, selectedTile.y).layers
    : []

  const initialLayers = initialWorld
    ? initialWorld.cellAt(selectedTile.x, selectedTile.y).layers
    : []

  const step = initialLayers.length - currentLayers.length + 1

  return (
    <div>
      <h2 className="text-center my-4 font-medium">
        Cell: (X: {selectedTile.x}, Y: {selectedTile.y})
      </h2>
      <Stepper orientation="vertical" value={step}>
        {initialLayers.map((layer, i) => (
          <StepperItem
            key={i}
            step={i + 1}
            className={`relative items-start not-last:flex-1 ${i + 1 < step ? "opacity-50" : ""}`}
          >
            <StepperTrigger className="items-start rounded pb-4 last:pb-0 pointer-events-none">
              <StepperIndicator />
              <ObjectDisplay layer={layer} />
            </StepperTrigger>
            {i + 1 < initialLayers.length && (
              <StepperSeparator className="absolute inset-y-0 top-[calc(1.5rem+0.125rem)] left-3 -order-1 m-0 -translate-x-1/2 group-data-[orientation=vertical]/stepper:h-[calc(100%-1.5rem-0.25rem)]" />
            )}
          </StepperItem>
        ))}
      </Stepper>
    </div>
  )
}

function ObjectDisplay({ layer }: { layer: schema.WorldObject }): JSX.Element {
  const { object } = layer

  const title = (): string => {
    switch (object.oneofKind) {
      case "survivor":
        return "Survivor"
      case "rubble":
        return "Rubble"
      default:
        return "Unknown Object"
    }
  }

  const description = (): JSX.Element => {
    switch (object.oneofKind) {
      case "survivor":
        return <span className="block">Health: {object.survivor.health}</span>
      case "rubble":
        return (
          <>
            <span className="block">
              Energy Required: {object.rubble.energyRequired}
            </span>
            <span className="block">
              Agents Required: {object.rubble.agentsRequired}
            </span>
          </>
        )
      default:
        return <em className="text-muted-foreground">No data</em>
    }
  }

  return (
    <div className="mt-0.5 px-2 text-left">
      <StepperTitle>{title()}</StepperTitle>
      <StepperDescription>{description()}</StepperDescription>
    </div>
  )
}
