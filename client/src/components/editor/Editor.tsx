import { useEffect, useRef, useState } from "react"
import useRound from "@/hooks/useRound"
import { Runner } from "@/core/Runner"
import Game from "@/core/Game"
import World from "@/core/World"
import { WorldParams } from "@/types"
import Games from "@/core/Games"
import Agents from "@/core/Agents"
import { EditorBrush } from "@/core/Brushes"
import Brush from "./Brush"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import useHover from "@/hooks/useHover"
import useCanvas from "@/hooks/useCanvas"
import { Renderer } from "@/core/Renderer"
import { MAP_MAX, MAP_MIN } from "@/utils/constants"
import NumberInput from "../NumberInput"
import { Label } from "../ui/label"
import { Button } from "../ui/button"

export default function Editor({ isOpen }: { isOpen: boolean }): JSX.Element | null {
  const round = useRound()
  const hoveredTile = useHover()
  const { rightClick, mouseDown } = useCanvas()
  const [brushes, setBrushes] = useState<EditorBrush[]>([])
  const [worldParams, setWorldParams] = useState<WorldParams>({ width: 15, height: 15, initialEnergy: 100 })
  const [isWorldEmpty, setIsWorldEmpty] = useState<boolean>(true)
  const editorGame = useRef<Games | null>(null)

  useEffect(() => {
    if (!isOpen) {
      Runner.setGames(undefined)
      return
    }
    if (!editorGame.current || !worldParams.imported) {
      const games = new Games()
      const agents = new Agents(games)
      const world = World.fromParams(worldParams.height, worldParams.width, worldParams.initialEnergy)
      const game = new Game(games, world, agents)
      games.currentGame = game
      editorGame.current = games
    }
    Runner.setGame(editorGame.current.currentGame)
    const round = editorGame.current.currentGame!.currentRound
    const loadedBrushes = round.world.getBrushes(round)
    loadedBrushes[0].open = true
    setBrushes(loadedBrushes)
    setIsWorldEmpty(round.world.isEmpty())
  }, [isOpen, worldParams])

  const worldEmpty = () => !round || round.world.isEmpty()
  const currentBrush = brushes.find(b => b.open)

  const clearWorld = () => {
    setIsWorldEmpty(true)
    setWorldParams({ ...worldParams, imported: null })
  }

  const handleBrushChange = (name: string) => {
    setBrushes(prev =>
      prev.map(b => b.withOpen(b.name === name))
    )
  }

  const applyBrush = (loc: { x: number, y: number }, rightClick: boolean) => {
    if (!currentBrush) return
    currentBrush.apply(loc.x, loc.y, currentBrush.fields, rightClick)
    Renderer.doFullRedraw()
    Renderer.fullRender()
    setIsWorldEmpty(worldEmpty());
  }

  useEffect(() => {
    if (mouseDown && hoveredTile) applyBrush(hoveredTile, rightClick)
  }, [hoveredTile, rightClick, mouseDown])

  if (!isOpen || brushes.length === 0 || !currentBrush) return null

  return (
    <div className="space-y-4">
      <Tabs
        value={currentBrush.name}
        onValueChange={handleBrushChange}
        className="w-full"
      >
        <TabsList className='flex items-center justify-center flex-wrap h-auto space-y-1'>
          {brushes.map((brush) => (
            <TabsTrigger
              key={brush.name}
              value={brush.name}
              className="text-xs sm:text-sm lg:px-4"
            >
              {brush.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {brushes.map((brush) => (
          <TabsContent key={brush.name} value={brush.name} className="mt-4">
            <Brush brush={brush} />
          </TabsContent>
        ))}
      </Tabs>
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-muted-foreground">Map Size</h3>
        <div className={`grid grid-cols-2 gap-4 ${isWorldEmpty ? "" : "pointer-events-none opacity-50"}`}>
          <div className="space-y-1">
            <Label htmlFor="width">Width</Label>
            <NumberInput
              name="width"
              value={worldParams.width}
              min={MAP_MIN}
              max={MAP_MAX}
              onChange={(name, val) =>
                setWorldParams(prev => ({ ...prev, [name]: val, imported: null }))
              }
            />
            <p className="text-xs text-muted-foreground">
              Min: {MAP_MIN}, Max: {MAP_MAX}
            </p>
          </div>

          <div className="space-y-1">
            <Label htmlFor="height">Height</Label>
            <NumberInput
              name="height"
              value={worldParams.height}
              min={MAP_MIN}
              max={MAP_MAX}
              onChange={(name, val) =>
                setWorldParams(prev => ({ ...prev, [name]: val, imported: null }))
              }
            />
            <p className="text-xs text-muted-foreground">
              Min: {MAP_MIN}, Max: {MAP_MAX}
            </p>
          </div>
        </div>
        <Button
          onClick={clearWorld}
          variant="destructive"
          size="sm"
          className={`w-full mt-2 ${isWorldEmpty ? "invisible" : ""}`}
        >
          Clear World
        </Button>
      </div>
    </div>
  )
}
