import { motion } from 'framer-motion'
import { AlertCircle, Download, Grid3x3, Info, Upload, Zap } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

import { useAppContext } from '@/contexts/AppContext'
import Game from '@/core/Game'
// import { WorldMap } from '@/core/world'
import { WorldParams } from '@/types'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import InfoDialog from '@/components/ui/InfoDialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import MapBrushes from './Map-brushes'
import { exportWorld, importWorld, WorldSerializer } from './MapGenerator'

// Clear map editor localStorage keys on every app start
localStorage.removeItem('editor_worldName')
localStorage.removeItem('editor_worldParams')
localStorage.removeItem('editor_worldData')

function MapEditor({ isOpen }: { isOpen: boolean }): JSX.Element | null {
  const MAP_MAX = 30
  const MAP_MIN = 3

  const { appState, setAppState } = useAppContext()
  const [worldName, setWorldName] = useState<string>(
    () => localStorage.getItem('editor_worldName') || ''
  )
  const [worldParams, setWorldParams] = useState<WorldParams>(() => {
    const saved = localStorage.getItem('editor_worldParams')
    return saved
      ? JSON.parse(saved)
      : { width: 15, height: 15, initialEnergy: 100, isInitialized: false }
  })
  const [errMsg, setErrMsg] = useState<string>('')
  const simulation = useRef<Game | undefined>(undefined)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [brushesInfoOpen, setBrushesInfoOpen] = useState(false)
  const [configInfoOpen, setConfigInfoOpen] = useState(false)
  const [managementInfoOpen, setManagementInfoOpen] = useState(false)

  const isWorldEmpty =
    !appState.editorSimulation || appState.editorSimulation.worldMap.isEmpty()

  const handleParamChange = (key: keyof WorldParams, value: number): void => {
    // Only trigger world recreation for width and height changes
    if (key === 'width' || key === 'height') {
      setWorldParams({
        ...worldParams,
        [key]: value,
        isInitialized: false
      })
    } else {
      // For other parameters like initialEnergy, just update without recreation
      setWorldParams({
        ...worldParams,
        [key]: value
      })
    }
  }

  const handleInitialEnergyChange = (value: number): void => {
    handleParamChange('initialEnergy', value)
  }

  const handleExport = async (): Promise<void> => {
    const err = await exportWorld(appState.editorSimulation!.worldMap, worldName)
    setErrMsg(err || '')
  }

  const handleImport = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    if (!e.target.files || e.target.files.length == 0) return
    const file = e.target.files[0]
    importWorld(file)
      .then((sim) => {
        simulation.current = sim
        setWorldParams({
          width: sim.worldMap.width,
          height: sim.worldMap.height,
          initialEnergy: sim.worldMap.startEnergy,
          isInitialized: true
        })
        setErrMsg('')
      })
      .catch((error) => setErrMsg(error))

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleMapEditorReset = (): void => {
    localStorage.removeItem('editor_worldName')
    localStorage.removeItem('editor_worldParams')
    localStorage.removeItem('editor_worldData')
    setWorldParams({ width: 15, height: 15, initialEnergy: 100, isInitialized: false })
    setWorldName('')
    setErrMsg('')
    setResetDialogOpen(false)
  }

  // Keep worldName and worldParams in localStorage
  useEffect(() => {
    localStorage.setItem('editor_worldName', worldName)
  }, [worldName])
  useEffect(() => {
    localStorage.setItem('editor_worldParams', JSON.stringify(worldParams))
  }, [worldParams])

  // useEffect(() => {
  //   const saveWorld = (): void => {
  //     if (appState.editorSimulation) {
  //       const worldData = WorldSerializer.toJSON(appState.editorSimulation.worldMap)
  //       localStorage.setItem('editor_worldData', JSON.stringify(worldData))
  //     }
  //   }
  // }, [appState.editorSimulation])

  useEffect(() => {
    if (isOpen) {
      if (!simulation.current || !worldParams.isInitialized) {
        let world
        const savedWorld = localStorage.getItem('editor_worldData')
        if (savedWorld) {
          world = WorldMap.fromData(JSON.parse(savedWorld))
        } else {
          world = WorldMap.fromParams(
            worldParams.width,
            worldParams.height,
            worldParams.initialEnergy
          )
        }
        simulation.current = new Game(world)
      }
      setAppState((prev) => ({
        ...prev,
        editorSimulation: simulation.current,
        editorSelectedCell: null
      }))
      worldParams.isInitialized = true
    } else {
      setAppState((prev) => ({
        ...prev,
        editorSimulation: undefined,
        editorSelectedCell: null
      }))
    }
  }, [worldParams, isOpen])

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4 overflow-auto h-full pb-4 scrollbar"
    >
      {/* Map Brushes Section */}
      <div className="relative">
        <div className="absolute top-2 right-2 z-10">
          <InfoDialog
            open={brushesInfoOpen}
            onOpenChange={setBrushesInfoOpen}
            trigger={
              <button
                type="button"
                className="hover:text-primary text-muted-foreground"
                aria-label="Map Brushes Info"
                onClick={() => setBrushesInfoOpen(true)}
              >
                <Info className="w-4 h-4" />
              </button>
            }
            title="Map Brushes"
          >
            <ul className="list-disc pl-5 space-y-2 text-left">
              <li>
                Select a brush type (Special Cells, Move Cost, Cell Contents) to edit
                the map with.
              </li>
              <li>
                Then choose either:
                <ul className="list-disc pl-5 mb-2 space-y-2 text-left">
                  <li>Which special cell (Killer, Charging, or Spawn)</li>
                  <li>What move cost (1-5, or custom)</li>
                  <li>Which cell content (Survivor or Rubble)</li>
                </ul>
                To start using the brush.
              </li>
              <li>
                Left-click on a cell to apply the selected brush. Right-click to remove
                it.
              </li>
              <li>
                <strong>Drag to paint:</strong> Click and drag across multiple cells to
                apply or remove the brush (Not for cell contents brush).
              </li>
            </ul>
          </InfoDialog>
        </div>
        <MapBrushes />
      </div>

      {/* World Configuration Section */}
      <Card className="relative">
        <div className="absolute top-2 right-2 z-10">
          <InfoDialog
            open={configInfoOpen}
            onOpenChange={setConfigInfoOpen}
            trigger={
              <button
                type="button"
                className="hover:text-primary text-muted-foreground"
                aria-label="World Configuration Info"
                onClick={() => setConfigInfoOpen(true)}
              >
                <Info className="w-4 h-4" />
              </button>
            }
            title="World Configuration"
          >
            <ul className="list-disc pl-5 space-y-2 text-left">
              <li>Set the width and height of the map before editing.</li>
              <li>Set the initial agent energy for new worlds.</li>
              <li>
                To change these settings after editing, reset the world (this will clear
                your current map).
              </li>
            </ul>
          </InfoDialog>
        </div>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Grid3x3 className="w-5 h-5" />
            <span>World Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                className={`flex items-center ${!isWorldEmpty ? 'text-muted-foreground/50 opacity-50' : ''}`}
              >
                <Grid3x3 className="w-4 h-4 mr-2 text-muted-foreground" />
                Width
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Input
                        type="number"
                        value={worldParams.width === 0 ? '' : worldParams.width}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                          const value =
                            e.target.value === '' ? 0 : Number(e.target.value)
                          handleParamChange('width', value)
                        }}
                        onBlur={(e: React.FocusEvent<HTMLInputElement>): void => {
                          let value = e.target.value === '' ? 0 : Number(e.target.value)

                          if (value < MAP_MIN) value = MAP_MIN
                          if (value > MAP_MAX) value = MAP_MAX

                          handleParamChange('width', value)
                        }}
                        className="w-full"
                        disabled={!isWorldEmpty}
                      />
                    </div>
                  </TooltipTrigger>
                  {!isWorldEmpty && (
                    <TooltipContent>
                      <p>Clear world to change</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="space-y-2">
              <Label
                className={`flex items-center ${!isWorldEmpty ? 'text-muted-foreground/50 opacity-50' : ''}`}
              >
                <Grid3x3 className="w-4 h-4 mr-2 text-muted-foreground" />
                Height
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Input
                        type="number"
                        value={worldParams.height === 0 ? '' : worldParams.height}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                          const value =
                            e.target.value === '' ? 0 : Number(e.target.value)
                          handleParamChange('height', value)
                        }}
                        onBlur={(e: React.FocusEvent<HTMLInputElement>): void => {
                          let value = e.target.value === '' ? 0 : Number(e.target.value)

                          if (value < MAP_MIN) value = MAP_MIN
                          if (value > MAP_MAX) value = MAP_MAX

                          handleParamChange('height', value)
                        }}
                        className="w-full"
                        disabled={!isWorldEmpty}
                      />
                    </div>
                  </TooltipTrigger>
                  {!isWorldEmpty && (
                    <TooltipContent>
                      <p>Reset world to change</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center">
              <Zap className="w-4 h-4 mr-2 text-muted-foreground" />
              Initial Agent Energy
            </Label>
            <Input
              type="number"
              value={worldParams.initialEnergy === 0 ? '' : worldParams.initialEnergy}
              onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                const value = e.target.value === '' ? 0 : Number(e.target.value)
                handleInitialEnergyChange(value)
              }}
              onBlur={(e: React.FocusEvent<HTMLInputElement>): void => {
                let value = e.target.value === '' ? 0 : Number(e.target.value)

                if (value < 1) value = 1

                handleInitialEnergyChange(value)
              }}
              className="w-full"
            // disabled={!isWorldEmpty}
            />
          </div>
        </CardContent>
        {/* In the JSX, always render the Dialog, but disable the trigger button if needed */}
        <div className="flex justify-center mb-4">
          <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                className="py-4 px-3"
                disabled={isWorldEmpty}
                onClick={(): void => setResetDialogOpen(true)}
              >
                Clear world
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Clear World?</DialogTitle>
                <DialogDescription>
                  This will clear the current world and allow you to modify its width
                  and height. Are you sure?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="secondary"
                  onClick={(): void => setResetDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleMapEditorReset}>
                  Clear World
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      {/* World Management Section */}
      <Card className="relative">
        <div className="absolute top-2 right-2 z-10">
          <InfoDialog
            open={managementInfoOpen}
            onOpenChange={setManagementInfoOpen}
            trigger={
              <button
                type="button"
                className="hover:text-primary text-muted-foreground"
                aria-label="World Management Info"
                onClick={() => setManagementInfoOpen(true)}
              >
                <Info className="w-4 h-4" />
              </button>
            }
            title="World Management"
          >
            <ul className="list-disc pl-5 space-y-2 text-left">
              <li>Enter a name for your world before exporting.</li>
              <li>Click Export to save your map as a .world file.</li>
              <li>Click Import to load an existing .world file into the editor.</li>
              <li>Errors during import/export will be shown below the buttons.</li>
            </ul>
          </InfoDialog>
        </div>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="w-5 h-5" />
            <span>World Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>World Name</Label>
            <Input
              placeholder="Enter world name"
              value={worldName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
                setWorldName(e.target.value)
              }
            />
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <Button
              onClick={handleExport}
              disabled={!worldName}
              className={`${!worldName ? 'cursor-not-allowed' : ''} w-full`}
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>

            <Button
              onClick={(): void => fileInputRef.current?.click()}
              variant="secondary"
              className="w-full"
            >
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
          </div>

          <input
            type="file"
            accept=".world"
            ref={fileInputRef}
            onChange={handleImport}
            className="hidden"
          />

          {errMsg && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <span>{errMsg}</span>
            </Alert>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default MapEditor
