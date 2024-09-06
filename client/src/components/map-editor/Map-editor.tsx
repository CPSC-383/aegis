import { useAppContext } from '@/context'
import { Simulation } from '@/simulation/simulation'
import { WorldMap } from '@/simulation/world-map'
import { WorldParams } from '@/utils/types'
import { useEffect, useRef, useState } from 'react'
import NumberInput from '../inputs/NumberInput'
import Button from '../Button'
import Input from '../inputs/Input'
import { exportWorld } from './MapGenerator'
import MapBrushes from './Map-brushes'

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

    const isWorldEmpty = !appState.simulation || appState.simulation.worldMap.isEmpty()

    const changeWidth = (width: number) => {
        setWorldParams({ ...worldParams, width, isInitialized: false })
    }

    const changeHeight = (height: number) => {
        setWorldParams({ ...worldParams, height, isInitialized: false })
    }

    const changeInitialEnergy = (initialEnergy: number) => {
        setWorldParams({ ...worldParams, initialEnergy, isInitialized: false })
    }

    const handleExport = async () => {
        const err = await exportWorld(appState.simulation!.worldMap, worldName)
        setErrMsg(err || '')
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
        <div>
            <MapBrushes />
            <div className="flex my-4 items-center justify-center">
                <p className="mr-2 text-xs">Width:</p>
                <NumberInput
                    value={worldParams.width}
                    onChange={changeWidth}
                    max={MAP_MAX}
                    min={MAP_MIN}
                    extraStyles="w-16"
                    disabled={!isWorldEmpty}
                />
                <p className="mr-2 ml-4 text-xs">Height:</p>
                <NumberInput
                    value={worldParams.height}
                    onChange={changeHeight}
                    max={MAP_MAX}
                    min={MAP_MIN}
                    extraStyles="w-16"
                    disabled={!isWorldEmpty}
                />
            </div>
            <div className="flex justify-center items-center">
                <p className="mr-2 text-xs">Initial Agent Energy:</p>
                <NumberInput
                    value={worldParams.initialEnergy}
                    onChange={changeInitialEnergy}
                    min={1}
                    extraStyles="w-16"
                    disabled={!isWorldEmpty}
                />
            </div>
            <Button
                onClick={() => setWorldParams({ ...worldParams, isInitialized: false })}
                label={'Clear to change world settings'}
                styles={`bg-secondary text-xs mt-2 ${isWorldEmpty ? 'invisible' : ''}`}
            />
            <div className="h-[4px] w-[90%] mx-auto border-[2px] border-black rounded-full my-3"></div>
            <div className="flex flex-col mt-4 justify-center items-center">
                <Input placeholder="World Name" value={worldName} onChange={setWorldName} />
                <Button onClick={handleExport} label="Export Map" styles="bg-primary mt-2" disabled={!worldName} />
                <div className="mt-2 text-red-600">{errMsg}</div>
            </div>
        </div>
    )
}

export default MapEditor
