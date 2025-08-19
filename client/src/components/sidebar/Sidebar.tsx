import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TabNames } from "@/types"
import { motion } from "framer-motion"
import { ChevronRight } from "lucide-react"
import { useEffect, useState } from "react"

import { ListenerKey, subscribe } from "@/core/Listeners"
import { Renderer } from "@/core/Renderer"
import useGames from "@/hooks/useGames"
import { createScaffold } from "@/services"
import Console from "../Console"
import Editor from "../editor/Editor"
import { ErrorMessage } from "../ui/error-message"
import Aegis from "./Aegis"
import Game from "./Game"
import Settings from "./Settings"

// Reusable tab list component
function TabList({
  tabNames,
  className = "",
}: {
  tabNames: TabNames[]
  className?: string
}): JSX.Element {
  return (
    <div className={`w-full flex ${className}`}>
      <TabsList className="w-full">
        {tabNames.map((tabName) => (
          <TabsTrigger key={tabName} value={tabName} className="text-sm w-full">
            {tabName}
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  )
}

export default function Sidebar(): JSX.Element {
  const scaffold = createScaffold()
  const { aegisPath, setupAegisPath, output, spawnError } = scaffold
  const games = useGames()
  const [selectedTab, setSelectedTab] = useState<TabNames>(TabNames.Aegis)
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    const unsubscribe = subscribe(ListenerKey.LayerViewer, () => {
      const tile = Renderer.getLayerViewerTile()
      if (tile && games?.playable) {
        setSelectedTab(TabNames.Game)
      }
    })

    return unsubscribe
  }, [games?.playable])

  return (
    <div className="relative w-[30%]">
      <motion.div
        animate={{ x: isCollapsed ? "100%" : "0%" }}
        transition={{ duration: 0.5 }}
        className="h-screen w-full bg-background shadow-lg absolute right-0 top-0 z-50 border-l"
      >
        <div className="flex flex-col h-full p-3">
          {!aegisPath ? (
            <div className="p-3">
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
                <TabList tabNames={Object.values(TabNames).slice(0, 2)} />
                <TabList tabNames={Object.values(TabNames).slice(2)} className="mt-2" />

                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex-1 flex flex-col overflow-auto scrollbar p-1">
                    <div className="flex-1">
                      <TabsContent value={TabNames.Aegis}>
                        <Aegis scaffold={scaffold} />
                      </TabsContent>
                      <TabsContent value={TabNames.Game}>
                        <Game scaffold={scaffold} />
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

                    {selectedTab !== TabNames.Settings &&
                      selectedTab !== TabNames.Editor && <Console output={output} />}
                  </div>
                </div>
              </Tabs>

              {spawnError && (
                <div className="mt-4">
                  <ErrorMessage title="Error" message={spawnError} />
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
