import { Button } from "@/components/ui/button"
import { SidebarView } from "@/types"
import {
  ChartBarBig,
  ChevronLeft,
  Gamepad2,
  Pencil,
  Settings as SettingsIcon,
} from "lucide-react"
import { useEffect, useState } from "react"

import { ListenerKey, subscribe } from "@/core/Listeners"
import { Renderer } from "@/core/Renderer"
import useGames from "@/hooks/useGames"
import { createScaffold } from "@/services"
import Console from "../Console"
import Editor from "../editor/Editor"
import Aegis from "./Aegis"
import Game from "./Game"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"
import { motion } from "framer-motion"
import SettingsModal from "./SettingsModal"

const sidebarItems = [
  { id: SidebarView.Aegis, icon: Gamepad2, label: "Start Game" },
  { id: SidebarView.Game, icon: ChartBarBig, label: "Game Stats" },
  { id: SidebarView.Editor, icon: Pencil, label: "Game Editor" },
  { id: SidebarView.Settings, icon: SettingsIcon, label: "Settings" },
]

export default function Sidebar(): JSX.Element {
  const scaffold = createScaffold()
  const { aegisPath, setupAegisPath, output, spawnError } = scaffold
  const games = useGames()
  const [selectedView, setSelectedView] = useState<SidebarView | null>(
    SidebarView.Aegis
  )
  const [settingsModalOpen, setSettingsModalOpen] = useState(false)

  useEffect(() => {
    const unsubscribe = subscribe(ListenerKey.LayerViewer, () => {
      const tile = Renderer.getLayerViewerTile()
      if (tile && games?.playable) {
        setSelectedView(SidebarView.Game)
      }
    })
    return unsubscribe
  }, [games?.playable])

  const handleSidebarClick = (itemId: SidebarView): void => {
    if (itemId === SidebarView.Settings) {
      setSettingsModalOpen(true)
    } else {
      setSelectedView(selectedView === itemId ? null : itemId)
    }
  }

  return (
    <div className="relative flex h-screen">
      <div
        className={`absolute top-4 -right-8 z-50 bg-accent rounded-full p-1 flex items-center justify-between
          ${!selectedView ? "hidden" : ""}`}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSelectedView(null)}
          className="h-4 w-4"
        >
          <ChevronLeft />
        </Button>
      </div>

      <div className="flex flex-col items-center py-4 w-16 h-full border-l">
        <TooltipProvider>
          {sidebarItems.map((item) => (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={() => handleSidebarClick(item.id)}
                  className={`
                  p-3 my-2 rounded-xl transition-colors 
                  ${
                    selectedView === item.id
                      ? "text-foreground bg-accent"
                      : "text-muted-foreground hover:bg-accent"
                  }
                  `}
                >
                  <item.icon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>

      <motion.div
        initial={false}
        animate={{ width: selectedView ? "20rem" : "0rem" }}
        transition={{ duration: 0.3 }}
        className="h-full overflow-hidden bg-background border-r"
      >
        {selectedView && (
          <div className="flex flex-col h-full overflow-auto p-3 scrollbar">
            {!aegisPath ? (
              <Button onClick={setupAegisPath} className="w-full">
                Setup Aegis Path
              </Button>
            ) : (
              <>
                {selectedView === SidebarView.Aegis && <Aegis scaffold={scaffold} />}
                {selectedView === SidebarView.Game && <Game scaffold={scaffold} />}
                {/* Editor always has to be visible or else it wont remove the game if we switch tabs */}
                <Editor
                  isOpen={selectedView === SidebarView.Editor}
                  scaffold={scaffold}
                />
                {selectedView !== SidebarView.Settings &&
                  selectedView !== SidebarView.Editor && <Console output={output} />}
                {spawnError && (
                  <div className="mt-4">
                    <ErrorMessage title="Error" message={spawnError} />
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}
