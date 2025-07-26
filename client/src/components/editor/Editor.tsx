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

function Editor({ isOpen }: { isOpen: boolean }): JSX.Element | null {
  const round = useRound()
  const hoveredTile = useHover()
  const { rightClick, mouseDown } = useCanvas()
  const [brushes, setBrushes] = useState<EditorBrush[]>([])
  const [worldParams] = useState<WorldParams>({ width: 15, height: 15, initialEnergy: 100 })
  const editorGame = useRef<Games | null>(null)

  useEffect(() => {
    if (!isOpen) {
      Runner.setGame(undefined)
      return
    }
    if (!editorGame.current) {
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
  }, [isOpen])

  const worldEmpty = () => !round || round.world.isEmpty()
  const currentBrush = brushes.find(b => b.open)

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
    </div>
  )
}

export default Editor
