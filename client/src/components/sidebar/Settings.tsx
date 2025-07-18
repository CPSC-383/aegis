import { motion } from 'framer-motion'
import { Bug, Folder, SettingsIcon, Trophy } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { Scaffold } from '@/services'

type Props = {
  scaffold: Scaffold
}

const Settings = ({ scaffold }: Props): JSX.Element => {
  const { aegisPath, setupAegisPath, refreshConfigPresets } = scaffold
  const [compMode, setCompMode] = useLocalStorage<boolean>('aegis_comp_mode', false)
  const [debugMode, setDebugMode] = useLocalStorage<boolean>('aegis_debug_mode', false)

  const handleCompModeToggle = async (checked: boolean): Promise<void> => {
    setCompMode(checked)
    localStorage.removeItem('aegis_config')
    await refreshConfigPresets()
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
            <Trophy className="w-6 h-6" />
            <h2 className="text-lg font-semibold">Competitive Mode</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Comp Mode</Label>
              <p className="text-xs text-muted-foreground">
                Enable competitive mode settings and configs
              </p>
            </div>
            <Switch checked={compMode} onCheckedChange={handleCompModeToggle} />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Bug className="w-6 h-6" />
            <h2 className="text-lg font-semibold">Debug Mode</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Debug Mode</Label>
              <p className="text-xs text-muted-foreground">Enables detailed logs</p>
            </div>
            <Switch
              checked={debugMode}
              onCheckedChange={(checked) => setDebugMode(checked)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-6 h-6" />
            <h2 className="text-lg font-semibold">Config Settings</h2>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>Config settings are now managed through config presets.</p>
            <p>Select a config preset in the Aegis tab to configure your simulation.</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default Settings
