import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

import { Scaffold } from '@/scaffold'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Config } from '@/utils/types'

type Props = {
    scaffold: Scaffold
}

function Settings({ scaffold }: Props) {
    const [moveCostToggle, setMoveCostToggle] = useState(true)
    const { aegisPath, setupAegisPath, toggleMoveCost, readAegisConfig } = scaffold

    const fetchMoveCostConfig = async () => {
        const config = await readAegisConfig()
        const { Enable_Move_Cost } = JSON.parse(config) as Config
        return Enable_Move_Cost
    }

    // Initialize default move cost toggle value when the settings load
    useEffect(() => {
        const initToggle = async () => {
            const value = await fetchMoveCostConfig()
            setMoveCostToggle(value)
        }
        initToggle()
    }, [])

    const handleToggle = (checked: boolean) => {
        toggleMoveCost(checked)
        setMoveCostToggle(checked)
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full"
        >
            <div className="space-y-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Folder className="w-6 h-6" />
                        <h2 className="text-lg font-semibold">Aegis Path</h2>
                    </div>

                    <p className="text-sm border-gray-400 border p-2 rounded break-words">
                        {aegisPath || 'No path configured'}
                    </p>

                    <Button onClick={setupAegisPath} className="w-full">
                        Reconfigure Aegis Path
                    </Button>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <SettingsIcon className="w-6 h-6" />
                        <h2 className="text-lg font-semibold">Config Settings</h2>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label>Move Cost</Label>
                            <p className="text-xs text-muted-foreground">
                                Know all move costs at the start of the game
                            </p>
                        </div>
                        <Switch checked={moveCostToggle} onCheckedChange={handleToggle} />
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

export default Settings
