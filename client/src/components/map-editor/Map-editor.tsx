import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Grid3x3, Zap, Download, Upload, AlertCircle } from 'lucide-react'

import { useAppContext } from '@/contexts/AppContext'
import { Simulation } from '@/core/simulation'
import { WorldMap } from '@/core/world'
import { WorldParams } from '@/types'
import { EventType, listenEvent } from '@/events'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog'
import { Alert } from '@/components/ui/alert'
import { exportWorld, importWorld, WorldSerializer } from './MapGenerator'
import MapBrushes from './Map-brushes'

// Clear map editor localStorage keys on every app start
localStorage.removeItem('editor_worldName')
localStorage.removeItem('editor_worldParams')
localStorage.removeItem('editor_worldData')

function MapEditor({ isOpen }: { isOpen: boolean }) {
    const MAP_MAX = 30
    const MAP_MIN = 3

    const { appState, setAppState } = useAppContext()
    const [worldName, setWorldName] = useState<string>(() => localStorage.getItem('editor_worldName') || '')
    const [worldParams, setWorldParams] = useState<WorldParams>(() => {
        const saved = localStorage.getItem('editor_worldParams')
        return saved ? JSON.parse(saved) : { width: 15, height: 15, initialEnergy: 100, isInitialized: false }
    })
    const [errMsg, setErrMsg] = useState<string>('')
    const simulation = useRef<Simulation | undefined>(undefined)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [resetDialogOpen, setResetDialogOpen] = useState(false)

    const isWorldEmpty = !appState.editorSimulation || appState.editorSimulation.worldMap.isEmpty()

    const handleParamChange = (key: keyof WorldParams, value: number) => {
        setWorldParams({
            ...worldParams,
            [key]: value,
            isInitialized: false
        })
    }

    const handleExport = async () => {
        const err = await exportWorld(appState.editorSimulation!.worldMap, worldName)
        setErrMsg(err || '')
    }

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length == 0) return
        const file = e.target.files[0]
        importWorld(file)
            .then((sim) => {
                simulation.current = sim
                setWorldParams({
                    width: sim.worldMap.width,
                    height: sim.worldMap.height,
                    initialEnergy: sim.worldMap.initialAgentEnergy,
                    isInitialized: true
                })
                setErrMsg('')
            })
            .catch((error) => setErrMsg(error))

        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleMapEditorReset = () => {
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

    useEffect(() => {
        const saveWorld = () => {
            if (appState.editorSimulation) {
                const worldData = WorldSerializer.toJSON(appState.editorSimulation.worldMap)
                localStorage.setItem('editor_worldData', JSON.stringify(worldData))
            }
        }
        document.addEventListener(EventType.RENDER_MAP, saveWorld)
        return () => {
            document.removeEventListener(EventType.RENDER_MAP, saveWorld)
        }
    }, [appState.editorSimulation])

    useEffect(() => {
        if (isOpen) {
            if (!simulation.current || !worldParams.isInitialized) {
                let world
                const savedWorld = localStorage.getItem('editor_worldData')
                if (savedWorld) {
                    world = WorldMap.fromData(JSON.parse(savedWorld))
                } else {
                    world = WorldMap.fromParams(worldParams.width, worldParams.height, worldParams.initialEnergy)
                }
                simulation.current = new Simulation(world)
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
            <MapBrushes />
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Grid3x3 className="w-5 h-5" />
                        <span>World Configuration</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="flex items-center">
                                <Grid3x3 className="w-4 h-4 mr-2 text-muted-foreground" />
                                Width
                            </Label>
                            <Input
                                type="number"
                                value={worldParams.width === 0 ? '' : worldParams.width}
                                onChange={(e) => {
                                    const value = e.target.value === '' ? 0 : Number(e.target.value)
                                    handleParamChange('width', value)
                                }}
                                onBlur={(e) => {
                                    let value = e.target.value === '' ? 0 : Number(e.target.value)

                                    if (value < MAP_MIN) value = MAP_MIN
                                    if (value > MAP_MAX) value = MAP_MAX

                                    handleParamChange('width', value)
                                }}
                                className="w-full"
                                disabled={!isWorldEmpty}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center">
                                <Grid3x3 className="w-4 h-4 mr-2 text-muted-foreground" />
                                Height
                            </Label>
                            <Input
                                type="number"
                                value={worldParams.height === 0 ? '' : worldParams.height}
                                onChange={(e) => {
                                    const value = e.target.value === '' ? 0 : Number(e.target.value)
                                    handleParamChange('height', value)
                                }}
                                onBlur={(e) => {
                                    let value = e.target.value === '' ? 0 : Number(e.target.value)

                                    if (value < MAP_MIN) value = MAP_MIN
                                    if (value > MAP_MAX) value = MAP_MAX

                                    handleParamChange('height', value)
                                }}
                                className="w-full"
                                disabled={!isWorldEmpty}
                            />
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
                            onChange={(e) => {
                                const value = e.target.value === '' ? 0 : Number(e.target.value)
                                handleParamChange('initialEnergy', value)
                            }}
                            onBlur={(e) => {
                                let value = e.target.value === '' ? 0 : Number(e.target.value)

                                if (value < 1) value = 1

                                handleParamChange('initialEnergy', value)
                            }}
                            className="w-full"
                            disabled={!isWorldEmpty}
                        />

                        {/* In the JSX, always render the Dialog, but disable the trigger button if needed */}
                        <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    variant="destructive"
                                    className="mt-2"
                                    disabled={isWorldEmpty}
                                    onClick={() => setResetDialogOpen(true)}
                                >
                                    Reset to Change Settings
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Reset World Settings?</DialogTitle>
                                    <DialogDescription>
                                        This will clear the current world and allow you to modify its settings. Are you
                                        sure?
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <Button variant="secondary" onClick={() => setResetDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button variant="destructive" onClick={handleMapEditorReset}>
                                        Reset Settings
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardContent>
            </Card>

            <Card>
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
                            onChange={(e) => setWorldName(e.target.value)}
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

                        <Button onClick={() => fileInputRef.current?.click()} variant="secondary" className="w-full">
                            <Upload className="mr-2 h-4 w-4" />
                            Import
                        </Button>
                    </div>

                    <input type="file" accept=".world" ref={fileInputRef} onChange={handleImport} className="hidden" />

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
