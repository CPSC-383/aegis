import { useEffect, useState } from 'react'
import { aegisAPI } from '@/aegis-api'
import Button from '@/components/Button'
import Input from '../inputs/Input'
import NumberInput from '../inputs/NumberInput'
import { useAppContext } from '@/context'
import Dropdown from '../Dropdown'
import { User } from 'lucide-react'
import { motion } from 'framer-motion'

interface AgentsProps {
    isOpen: boolean
    aegisPath: string
    numAgentsAegis: number
    agents: string[]
}

function Agents({ isOpen, aegisPath, numAgentsAegis, agents }: AgentsProps) {
    const { appState } = useAppContext()
    const [groupName, setGroupName] = useState<string>('')
    const [numAgents, setNumAgents] = useState<number>(0)
    const [maxAgents, setMaxAgents] = useState<number>(0)
    const [agent, setAgent] = useState<string>('')
    const isButtonDisabled = !groupName || !numAgents || !agent

    useEffect(() => {
        setMaxAgents(numAgentsAegis)
    }, [numAgentsAegis, appState.simulation])

    const handleGroupName = (value: string) => {
        // dont allow space characters and dont allow longer than 10 characters
        setGroupName(value.replace(/\s/g, '').slice(0, 10))
    }

    const handleConnectAgents = async () => {
        if (!aegisPath) {
            throw new Error("Can't find AEGIS path!")
        }

        // Update max and reset input
        setMaxAgents((prev) => Math.max(0, prev - numAgents))
        setNumAgents(0)

        await aegisAPI.agent_child_process.spawn(aegisPath, groupName.toString(), numAgents.toString(), agent)
    }

    if (!isOpen) return null
    return (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="h-fit flex flex-col justify-between">
                <div className="space-y-2">
                    <Dropdown
                        items={agents}
                        selectedItem={agent}
                        onSelect={(item) => setAgent(item)}
                        label={'Select an agent'}
                        placeholder={'Select an agent'}
                        icon={User}
                    />
                    <div>
                        <p className="text-xs font-semibold">Group Name:</p>
                        <Input
                            value={groupName}
                            onChange={(value) => handleGroupName(value)}
                            placeholder="Group Name"
                        />
                        <p className="text-xs font-semibold mt-2">Number of Agents to Connect:</p>
                        <NumberInput
                            value={numAgents}
                            onChange={(value) => setNumAgents(value)}
                            max={maxAgents}
                            min={0}
                            placeholder="Number of Agents"
                            extraStyles="w-full"
                        />
                    </div>
                    {maxAgents ? <p className="text-xs">{maxAgents} agents left to connect.</p> : null}
                    <Button
                        onClick={handleConnectAgents}
                        label={'Connect Agents'}
                        styles="bg-primary"
                        disabled={isButtonDisabled}
                    />
                </div>
            </div>
        </motion.div>
    )
}

export default Agents
