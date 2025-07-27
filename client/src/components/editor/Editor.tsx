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
import { importWorld } from "./MapGenerator"

export default function Editor({ isOpen }: { isOpen: boolean }): JSX.Element | null {
  const round = useRound()
  const hoveredTile = useHover()
  const { rightClick, mouseDown } = useCanvas()
  const [brushes, setBrushes] = useState<EditorBrush[]>([])
  const [worldParams, setWorldParams] = useState<WorldParams>({ width: 15, height: 15, initialEnergy: 100 })
  const [isWorldEmpty, setIsWorldEmpty] = useState<boolean>(true)

  const editorGame = useRef<Games | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!isOpen) {
      Runner.setGames(undefined)
      return
    }
    if (worldParams.imported) {
      editorGame.current = worldParams.imported
    } else if (!editorGame.current || worldParams.imported === null) {
      const games = new Games()
      const agents = new Agents(games)
      const world = World.fromParams(worldParams.height, worldParams.width, worldParams.initialEnergy)
      const game = new Game(games, world, agents)
      games.currentGame = game
      editorGame.current = games
    }

    worldParams.imported = undefined

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

  const handleExport = () => {
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0]
    if (!file) return
    importWorld(file)
      .then((games) => {
        const world = games.currentGame!.currentRound.world
        console.log(world)
        setWorldParams({
          width: world.size.width,
          height: world.size.height,
          initialEnergy: world.startEnergy,
          imported: games
        })
      })
    // Reset so we can import the same file after we clear (weird edge case ngl)
    e.target.value = ''
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
    <div className="space-y-3">
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
          <TabsContent key={brush.name} value={brush.name} className="mt-2">
            <Brush brush={brush} />
          </TabsContent>
        ))}
      </Tabs>
      <section className="space-y-2 border-t pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">Map Configuration</h3>
          <Button
            onClick={clearWorld}
            variant="outline"
            size="sm"
            className={`h-7 px-3 text-xs text-destructive hover:text-destructive-foreground hover:bg-destructive ${isWorldEmpty ? "invisible" : ""
              }`}
          >
            Clear
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
          <div className={`space-y-1 ${isWorldEmpty ? "" : "pointer-events-none opacity-50"}`}>
            <Label htmlFor="width" className="text-xs text-muted-foreground">Width</Label>
            <NumberInput
              name="width"
              value={worldParams.width}
              min={MAP_MIN}
              max={MAP_MAX}
              onChange={(name, val) =>
                setWorldParams(prev => ({ ...prev, [name]: val, imported: null }))
              }
            />
          </div>

          <div className={`space-y-1 ${isWorldEmpty ? "" : "pointer-events-none opacity-50"}`}>
            <Label htmlFor="height" className="text-xs text-muted-foreground">Height</Label>
            <NumberInput
              name="height"
              value={worldParams.height}
              min={MAP_MIN}
              max={MAP_MAX}
              onChange={(name, val) =>
                setWorldParams(prev => ({ ...prev, [name]: val, imported: null }))
              }
            />
          </div>

          <div className="col-span-1 sm:col-span-2 space-y-1">
            <Label htmlFor="initialEnergy" className="text-xs text-muted-foreground">Initial Energy</Label>
            <NumberInput
              name="initialEnergy"
              value={worldParams.initialEnergy}
              min={1}
              max={1000}
              onChange={(name, val) =>
                setWorldParams(prev => ({ ...prev, [name]: val }))
              }
            />
          </div>
        </div>
      </section>
      <section className="space-y-2 border-t pt-2">
        <h3 className="text-sm font-medium text-foreground">Import & Export</h3>
        <div className="flex flex-row gap-4">
          <Button
            onClick={() => fileInputRef.current?.click()}
          >
            Import
          </Button>
          <Button
            onClick={handleExport}
          >
            Export
          </Button>
        </div>
      </section>

      <input
        type="file"
        accept=".world"
        ref={fileInputRef}
        onChange={handleImport}
        hidden
      />
    </div>
  )
}
