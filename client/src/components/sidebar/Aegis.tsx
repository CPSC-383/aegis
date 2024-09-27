import { useState } from 'react'
import Button from '@/components/Button'
import NumberInput from '../inputs/NumberInput'
import { Scaffold } from '@/scaffold'

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
        <div className="h-fit flex flex-col justify-between">
            <div className="space-y-2">
                <select
                    className="bg-white p-2 w-full border-2 border-gray-300 focus:border-accent-light rounded-md focus:outline-none"
                    value={worldFile}
                    onChange={(e) => setWorldFile(e.target.value)}
                >
                    <option value="">Select a world</option>
                    {worlds
                        .filter((world) => world.endsWith('.world'))
                        .map((world, i) => (
                            <option key={i} value={world}>
                                {world.replace('.world', '')}
                            </option>
                        ))}
                </select>
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
    )
}

export default Aegis
