import { useState } from 'react'
import Button from '@/components/Button'
import NumberInput from '../inputs/NumberInput'
import { Scaffold } from '@/scaffold'
import Dropdown from '../Dropdown'
import { Globe } from 'lucide-react'
import { motion } from 'framer-motion'

interface Props {
    isOpen: boolean
    numAgentsAegis: number
    setNumAgentsAegis: (value: number) => void
    scaffold: Scaffold
}

function Aegis({ isOpen, numAgentsAegis, setNumAgentsAegis, scaffold }: Props) {
    const { worlds, startSimulation, killSim } = scaffold
    const [worldFile, setWorldFile] = useState<string>('')
    const [numRounds, setNumRounds] = useState<number>(0)
    const isButtonDisabled = !worldFile || !numRounds || !numAgentsAegis

    if (!isOpen) return null
    return (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="h-fit flex flex-col justify-between">
                <div className="space-y-2">
                    <Dropdown
                        items={worlds.filter((world) => world.endsWith('.world'))}
                        selectedItem={worldFile}
                        onSelect={(item) => setWorldFile(item)}
                        label={'Select a world'}
                        placeholder={'Select a world'}
                        icon={Globe}
                    />
                    <div>
                        <p className="text-xs font-semibold">Number of Agents:</p>
                        <NumberInput
                            value={numAgentsAegis}
                            onChange={(value) => setNumAgentsAegis(value)}
                            min={0}
                            placeholder="Number of Agents"
                            extraStyles="w-full"
                        />
                        <p className="text-xs font-semibold mt-2">Number of Rounds:</p>
                        <NumberInput
                            value={numRounds}
                            onChange={(value) => setNumRounds(value)}
                            min={0}
                            placeholder="Number of Rounds"
                            extraStyles="w-full"
                        />
                    </div>
                    {killSim ? (
                        <Button onClick={killSim} label="Kill Game" styles="bg-secondary" />
                    ) : (
                        <Button
                            onClick={() => startSimulation(numRounds, numAgentsAegis, worldFile)}
                            label="Start Up Game"
                            styles="bg-primary"
                            disabled={isButtonDisabled}
                        />
                    )}
                </div>
            </div>
        </motion.div>
    )
}

export default Aegis
