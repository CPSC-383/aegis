import GameArea from "./components/Game-area"
import ControlsBar from "./components/controls-bar/Controls-bar"
import LayerEditor from "./components/dnd/LayerEditor"
import Sidebar from "./components/sidebar/Sidebar"
import { ListenerKey, subscribe } from "./core/Listeners"
import { Renderer } from "./core/Renderer"
import useGames from "./hooks/useGames"
import useRound from "./hooks/useRound"

import { useEffect, useState } from "react"
import { Vector } from "./types"

export default function App(): JSX.Element {
  const games = useGames()
  const round = useRound()
  const [isLayerViewerOpen, setIsLayerViewerOpen] = useState<boolean>(false)
  const [selectedTileForViewer, setSelectedTileForViewer] = useState<
    Vector | undefined
  >(undefined)

  useEffect(() => {
    const unsubscribe = subscribe(ListenerKey.LayerViewer, () => {
      const tile = Renderer.getLayerViewerTile()
      if (tile && games?.playable && round) {
        setSelectedTileForViewer(tile)
        setIsLayerViewerOpen(true)
      }
    })

    return unsubscribe
  }, [games?.playable, round])

  const handleCloseLayerViewer = (): void => {
    setIsLayerViewerOpen(false)
    setSelectedTileForViewer(undefined)
  }

  return (
    <div className="flex bg-background overflow-hidden">
      <div className="flex w-full h-screen justify-center">
        <GameArea />
        {games?.playable && <ControlsBar />}
      </div>
      <Sidebar />

      {games?.playable && (
        <LayerEditor
          tile={isLayerViewerOpen ? selectedTileForViewer : undefined}
          round={round}
          editable={false}
          onClose={handleCloseLayerViewer}
        />
      )}
    </div>
  )
}
