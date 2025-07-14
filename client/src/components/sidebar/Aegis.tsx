import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Scaffold } from '@/services'
import { ASSIGNMENT_A1, getCurrentAssignment } from '@/utils/util'

interface Props {
    scaffold: Scaffold
}

function Aegis({ scaffold }: Props) {
    const { worlds, agents, startSimulation, killSim } = scaffold
    const [world, setWorld] = useState<string>('')
    const [rounds, setRounds] = useState<number>(0)
    const [group, setGroup] = useState<string>('')
    const [agent, setAgent] = useState<string>('')

    const isButtonDisabled = useMemo(() => !world || !rounds || !group || !agent, [world, rounds, group, agent])

    const handleRoundBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value)
        if (!isNaN(value)) {
            const newValue = Math.max(1, value)
            setRounds(newValue)
        }
    }

    const handleGroupName = (value: string) => {
        // don't allow space characters
        setGroup(value.replace(/\s/g, ''))
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
        >
            <div>
                <Label>Select a World</Label>
                <Select value={world} onValueChange={(value) => setWorld(value)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Choose a world">{world || 'Select a world'}</SelectValue>
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

            <div>
                <Label>Number of Rounds</Label>
                <Input
                    type="number"
                    value={rounds === 0 ? '' : rounds}
                    onChange={(e) => {
                        const value = e.target.value === '' ? 0 : Number(e.target.value)
                        setRounds(value)
                    }}
                    onBlur={handleRoundBlur}
                    placeholder="Enter number of rounds"
                    className="w-full"
                />
            </div>

            <div>
                <Label>Select an Agent</Label>
                <Select value={agent} onValueChange={(value) => setAgent(value)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Choose an agent">{agent || 'Select an agent'}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        {agents.map((agentName) => (
                            <SelectItem key={agentName} value={agentName}>
                                {agentName}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div>
                <Label>Group Name</Label>
                <Input value={group} onChange={(e) => handleGroupName(e.target.value)} placeholder="Enter group name" />
            </div>

            <div className="flex flex-col mt-4">
                {killSim ? (
                    <Button variant="destructive" onClick={killSim}>
                        Kill Game
                    </Button>
                ) : (
                    <Button
                        onClick={() => {
                            const amount = getCurrentAssignment() === ASSIGNMENT_A1 ? 1 : 7
                            startSimulation(rounds.toString(), amount.toString(), world, group, agent)
                        }}
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
