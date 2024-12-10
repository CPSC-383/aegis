import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import createScaffold from '@/scaffold'
import { useAppContext } from '@/context'
import { TabNames } from '@/utils/types'
import { ChevronRight } from 'lucide-react'

import Tabs from '@/components/Tabs'
import Aegis from './Aegis'
import Agents from './Agents'
import Console from '../Console'
import Button from '../Button'
import InfoPanel from '../info-panel/Info-panel'
import MapEditor from '../map-editor/Map-editor'
import Game from './Game'
import Settings from './Settings'
import PopupConsole from '../Popup-console'

function Sidebar() {
    const scaffold = createScaffold()
    const { aegisPath, setupAegisPath, agents, output } = scaffold
    const { appState } = useAppContext()

    const sidebarRef = useRef<HTMLDivElement | null>(null)

    const [numAgentsAegis, setNumAgentsAegis] = useState<number>(0)
    const [selectedTab, setSelectedTab] = useState<TabNames>(TabNames.Aegis)
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isPopupOpen, setIsPopupOpen] = useState(false)

    useEffect(() => {
        setIsCollapsed(appState.selectedCell != null)
    }, [appState.selectedCell])

    return (
        <div className="relative w-[30%]">
            <motion.div
                ref={sidebarRef}
                animate={{
                    x: isCollapsed ? '100%' : '0%'
                }}
                transition={{ duration: 0.5 }}
                className="h-screen w-full bg-white absolute right-0 top-0 z-50"
            >
                <div className="flex flex-col justify-between h-full p-4">
                    {!aegisPath ? (
                        <Button onClick={setupAegisPath} label="Setup Aegis Path" styles="bg-primary" />
                    ) : (
                        <>
                            <div className="flex flex-col h-screen">
                                <Tabs selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
                                <Aegis
                                    isOpen={selectedTab === TabNames.Aegis}
                                    numAgentsAegis={numAgentsAegis}
                                    setNumAgentsAegis={setNumAgentsAegis}
                                    scaffold={scaffold}
                                />
                                <Agents
                                    isOpen={selectedTab === TabNames.Agents}
                                    aegisPath={aegisPath || ''}
                                    numAgentsAegis={numAgentsAegis}
                                    agents={agents}
                                />
                                <Game isOpen={selectedTab === TabNames.Game} />
                                <MapEditor isOpen={selectedTab === TabNames.Editor} />
                                <Settings
                                    isOpen={selectedTab === TabNames.Settings}
                                    setupAegisPath={setupAegisPath}
                                    aegisPath={aegisPath || ''}
                                />
                            </div>
                            {(selectedTab === TabNames.Agents ||
                                selectedTab === TabNames.Aegis ||
                                selectedTab === TabNames.Game) && (
                                <Console output={output} isPopupOpen={isPopupOpen} setIsPopupOpen={setIsPopupOpen} />
                            )}
                        </>
                    )}
                </div>
                <button onClick={() => setIsCollapsed(!isCollapsed)} className="absolute top-1/2 rotate-180 -left-6">
                    <motion.div
                        animate={{ rotate: isCollapsed ? 0 : 180 }}
                        transition={{ duration: 0.5 }}
                        className="cursor-pointer"
                    >
                        <ChevronRight />
                    </motion.div>
                </button>
            </motion.div>
            <InfoPanel />
            <PopupConsole output={output} isPopupOpen={isPopupOpen} setIsPopupOpen={setIsPopupOpen} />
        </div>
    )
}

export default Sidebar
