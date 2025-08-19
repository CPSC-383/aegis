import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TabNames, Vector } from "@/types"
import { motion } from "framer-motion"
import { ChevronRight } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { ListenerKey, subscribe } from "@/core/Listeners"
import { Renderer } from "@/core/Renderer"
import useGames from "@/hooks/useGames"
import useRound from "@/hooks/useRound"
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
  const round = useRound()
  const [selectedTab, setSelectedTab] = useState<TabNames>(TabNames.Aegis)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [selectedTile, setSelectedTile] = useState<Vector | undefined>(undefined)
  const sidebarRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const unsubscribe = subscribe(ListenerKey.LayerViewer, () => {
      const tile = Renderer.getLayerViewerTile()
      if (tile && games?.playable && round) {
        setSelectedTab(TabNames.Game)
        setSelectedTile(tile)
      }
    })

    return unsubscribe
  }, [games?.playable, round])

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
            </div>
          ) : (
            <>
              <Tabs
                value={selectedTab}
                onValueChange={(value) => setSelectedTab(value as TabNames)}
                className="flex flex-col h-full"
              >
                <div className="w-full flex">
                  <TabsList className="w-full">
                    {Object.values(TabNames)
                      .slice(0, 2)
                      .map((tabName) => (
                        <TabsTrigger
                          key={tabName}
                          value={tabName}
                          className="text-sm w-full"
                        >
                          {tabName}
                        </TabsTrigger>
                      ))}
                  </TabsList>
                </div>

                <div className="w-full flex mt-2">
                  <TabsList className="w-full">
                    {Object.values(TabNames)
                      .slice(2)
                      .map((tabName) => (
                        <TabsTrigger
                          key={tabName}
                          value={tabName}
                          className="text-sm w-full"
                        >
                          {tabName}
                        </TabsTrigger>
                      ))}
                  </TabsList>
                </div>

                <div className="flex-1 overflow-auto scrollbar p-1">
                  <TabsContent value={TabNames.Aegis}>
                    <div className="flex flex-col justify-between h-full gap-6 p-1">
                      <Aegis scaffold={scaffold} />
                      <div className="min-h-[200px]">
                        <Console output={output} />
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value={TabNames.Game} className="h-full">
                    <div className="flex flex-col justify-between h-full gap-6 p-1 scrollbar overflow-scroll">
                      <Game tile={selectedTile} round={round} scaffold={scaffold} />
                      <div className="min-h-[200px]">
                        <Console output={output} />
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value={TabNames.Editor}>
                    <Editor
                      isOpen={selectedTab === TabNames.Editor}
                      scaffold={scaffold}
                    />
                  </TabsContent>
                  <TabsContent value={TabNames.Settings}>
                    <Settings scaffold={scaffold} />
                  </TabsContent>
                </div>
              </Tabs>

              {spawnError && (
                <div className="mt-4 rounded-md border border-red-300 bg-red-100 p-3 text-sm text-red-800">
                  <strong>Error:</strong> {spawnError}
                </div>
              )}
            </>
          )}
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute top-1/2 -left-6 transform -translate-y-1/2 flex items-center justify-center w-10 h-10 bg-background border shadow rounded-full"
        >
          <motion.div
            animate={{ rotate: isCollapsed ? 0 : 180 }}
            transition={{ duration: 0.5 }}
          >
            <ChevronRight size={20} />
          </motion.div>
        </button>
      </motion.div>
    </div>
  )
}
