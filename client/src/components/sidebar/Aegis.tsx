import { useMemo } from 'react'
import { motion } from 'framer-motion'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Scaffold } from '@/scaffold'
import { ASSIGNMENT_A1, getCurrentAssignment } from '@/utils/util'

interface Props {
    scaffold: Scaffold
    worldFile: string
    setWorldFile: (value: string) => void
    numRounds: number
    setNumRounds: (value: number) => void
}

function Aegis({ scaffold, worldFile, setWorldFile, numRounds, setNumRounds }: Props) {
    const { worlds, startSimulation, killSim } = scaffold

    const isButtonDisabled = useMemo(() => !worldFile || !numRounds, [worldFile, numRounds])

    const handleRoundBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value)
        if (!isNaN(value)) {
            const newValue = Math.max(1, value)
            setNumRounds(newValue)
        }
    }

    return (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div>
                <Label>Select a World</Label>
                <Select value={worldFile} onValueChange={(value) => setWorldFile(value)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Choose a world">{worldFile || 'Select a world'}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        {worlds.map((world) => (
                            <SelectItem key={world} value={world}>
                                {world}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="mt-4">
                <Label>Number of Rounds</Label>
                <Input
                    type="number"
                    value={numRounds === 0 ? '' : numRounds}
                    onChange={(e) => {
                        const value = e.target.value === '' ? 0 : Number(e.target.value)
                        setNumRounds(value)
                    }}
                    onBlur={handleRoundBlur}
                    placeholder="Enter number of rounds"
                    className="w-full"
                />
            </div>

            <div className="flex flex-col mt-4">
                {killSim ? (
                    <Button variant="destructive" onClick={killSim}>
                        Kill Game
                    </Button>
                ) : (
                    <Button
                        onClick={() =>
                            startSimulation(numRounds, getCurrentAssignment() === ASSIGNMENT_A1 ? 1 : 7, worldFile)
                        }
                        disabled={isButtonDisabled}
                        className={`${isButtonDisabled ? 'cursor-not-allowed' : ''}`}
                    >
                        Start Up Game
                    </Button>
                )}
            </div>
        </motion.div>
    )
}

export default Aegis
