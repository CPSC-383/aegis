import { useAppContext } from '@/context'
import { Simulation } from '@/simulation/simulation'
import { WorldMap } from '@/simulation/world-map'
import { WorldParams } from '@/utils/types'
import { useEffect, useRef, useState } from 'react'
import NumberInput from '../inputs/NumberInput'
import Button from '../Button'
import Input from '../inputs/Input'
import { exportWorld, importWorld } from './MapGenerator'
import MapBrushes from './Map-brushes'
import { motion } from 'framer-motion'
import { AlertCircle, Download, Grid3x3, Zap } from 'lucide-react'

function MapEditor({ isOpen }: { isOpen: boolean }) {
    const MAP_MAX = 30
    const MAP_MIN = 3

    const { appState, setAppState } = useAppContext()
    const [worldName, setWorldName] = useState<string>('')
    const [worldParams, setWorldParams] = useState<WorldParams>({
        width: 15,
        height: 15,
        initialEnergy: 500,
        isInitialized: false
    })
    const [errMsg, setErrMsg] = useState<string>('')
    const simulation = useRef<Simulation | undefined>(undefined)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const isWorldEmpty = !appState.simulation || appState.simulation.worldMap.isEmpty()

    const handleExport = async () => {
        const err = await exportWorld(appState.simulation!.worldMap, worldName)
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

    const handleReset = () => {
        setWorldParams({ ...worldParams, isInitialized: false })
        setErrMsg('')
    }

    useEffect(() => {
        if (isOpen) {
            if (!simulation.current || !worldParams.isInitialized) {
                const world = WorldMap.fromParams(worldParams.width, worldParams.height, worldParams.initialEnergy)
                simulation.current = new Simulation(world)
            }

            setAppState((prev) => ({
                ...prev,
                simulation: simulation.current,
                selectedCell: null
            }))
            worldParams.isInitialized = true
        } else {
            setAppState((prev) => ({
                ...prev,
                simulation: undefined,
                selectedCell: null
            }))
        }
    }, [worldParams, isOpen])

    if (!isOpen) return null

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4 overflow-auto pb-4 scrollbar"
        >
            <MapBrushes />

            <div className="space-y-3 p-4 bg-gray-50 rounded-lg shadow-sm">
                <div className="flex items-center space-x-2 mb-4">
                    <motion.h2
                        className="text-lg font-semibold text-gray-800 flex items-center space-x-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <Grid3x3 className="w-5 h-5" />
                        <span>World Configuration</span>
                    </motion.h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm flex items-center text-gray-700">
                            <Grid3x3 className="w-4 h-4 mr-2 text-gray-500" />
                            Width
                        </label>
                        <NumberInput
                            value={worldParams.width}
                            onChange={(width: number) => {
                                setWorldParams({ ...worldParams, width, isInitialized: false })
                            }}
                            max={MAP_MAX}
                            min={MAP_MIN}
                            extraStyles="w-full"
                            disabled={!isWorldEmpty}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm flex items-center text-gray-700">
                            <Grid3x3 className="w-4 h-4 mr-2 text-gray-500" />
                            Height
                        </label>
                        <NumberInput
                            value={worldParams.height}
                            onChange={(height: number) => {
                                setWorldParams({ ...worldParams, height, isInitialized: false })
                            }}
                            max={MAP_MAX}
                            min={MAP_MIN}
                            extraStyles="w-full"
                            disabled={!isWorldEmpty}
                        />
                    </div>
                </div>

                <div className="space-y-2 mt-4">
                    <label className="text-sm flex items-center text-gray-700">
                        <Zap className="w-4 h-4 mr-2 text-gray-500" />
                        Initial Agent Energy
                    </label>
                    <NumberInput
                        value={worldParams.initialEnergy}
                        onChange={(initialEnergy: number) => {
                            setWorldParams({ ...worldParams, initialEnergy, isInitialized: false })
                        }}
                        max={MAP_MAX}
                        min={1}
                        extraStyles="w-full"
                        disabled={!isWorldEmpty}
                    />

                    {!isWorldEmpty && (
                        <Button
                            onClick={handleReset}
                            label={'Reset to change settings'}
                            styles="text-sm bg-secondary mt-2 hover:bg-[#e9505b] transition-colors duration-200"
                        />
                    )}
                </div>
            </div>

            <div className="space-y-3 p-4 bg-gray-50 rounded-lg shadow-sm">
                <div className="flex items-center space-x-2 mb-4">
                    <motion.h2
                        className="text-lg font-semibold text-gray-800 flex items-center space-x-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <Download className="w-5 h-5" />
                        <span>World Management</span>
                    </motion.h2>
                </div>

                <div className="space-y-3">
                    <Input placeholder="World Name" value={worldName} onChange={setWorldName} />

                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            onClick={handleExport}
                            disabled={!worldName}
                            label={'Export'}
                            styles="bg-primary mt-2 hover:bg-[#71c3c6] transition-colors duration-200"
                        />

                        <Button
                            onClick={() => fileInputRef.current?.click()}
                            label={'Import'}
                            styles="bg-primary mt-2 hover:bg-[#71c3c6] transition-colors duration-200"
                        />
                    </div>

                    <input type="file" accept=".world" ref={fileInputRef} onChange={handleImport} className="hidden" />

                    {errMsg && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-500 text-sm flex items-center bg-red-50 p-2 rounded-md border border-red-200"
                        >
                            <AlertCircle className="w-5 h-5 mr-2" />
                            {errMsg}
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.div>
    )
}

export default MapEditor
