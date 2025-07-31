import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TabNames } from '@/types'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { createScaffold } from '@/services'
import Console from '../Console'
import InfoPanel from '../info-panel/Info-panel'
import Editor from '../editor/Editor'
import Aegis from './Aegis'
import Game from './Game'
import Settings from './Settings'

export default function Sidebar(): JSX.Element {
  const scaffold = createScaffold()
  const { aegisPath, setupAegisPath, output } = scaffold
  const [selectedTab, setSelectedTab] = useState<TabNames>(TabNames.Aegis)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const sidebarRef = useRef<HTMLDivElement | null>(null)

  // useEffect(() => {
  //   setIsCollapsed(!!selectedCell || !!editorSelectedCell)
  // }, [selectedCell, editorSelectedCell])

  return (
    <div className="relative w-[30%]">
      <motion.div
        ref={sidebarRef}
        animate={{ x: isCollapsed ? '100%' : '0%' }}
        transition={{ duration: 0.5 }}
        className="h-screen w-full bg-background shadow-lg absolute right-0 top-0 z-50 border-l"
      >
        <div className="flex flex-col justify-between h-full p-4">
          {!aegisPath ? (
            <div className="p-4">
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

                <div className="overflow-auto scrollbar p-1">
                  <TabsContent value={TabNames.Aegis}>
                    <Aegis scaffold={scaffold} />
                  </TabsContent>
                  <TabsContent value={TabNames.Game}>
                    <Game />
                  </TabsContent>
                  <TabsContent value={TabNames.Editor}>
                    <Editor isOpen={selectedTab === TabNames.Editor} />
                  </TabsContent>
                  <TabsContent value={TabNames.Settings}>
                    <Settings scaffold={scaffold} />
                  </TabsContent>
                </div>
              </Tabs>

              {(selectedTab === TabNames.Aegis || selectedTab === TabNames.Game) && (
                <Console output={output} />
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
      <InfoPanel />
    </div>
  )
}
