import { useEffect, useState } from 'react'
import { aegisAPI } from '@/aegis-api'
import Button from '@/components/Button'
import Input from '../inputs/Input'
import NumberInput from '../inputs/NumberInput'
import { useAppContext } from '@/context'

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
        // dont allow space characters
        setGroupName(value.replace(/\s/g, ''))
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
        <div className="h-fit flex flex-col justify-between">
            <div className="space-y-2">
                <select
                    className="bg-white p-2 w-full border-2 border-gray-300 focus:border-accent-light rounded-md focus:outline-none"
                    value={agent}
                    onChange={(e) => setAgent(e.target.value)}
                >
                    <option value="">Select an agent</option>
                    {agents.map((agent, i) => (
                        <option key={i} value={agent}>
                            {agent}
                        </option>
                    ))}
                </select>
                <div>
                    <p className="text-xs font-semibold">Group Name:</p>
                    <Input value={groupName} onChange={(value) => handleGroupName(value)} placeholder="Group Name" />
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
    )
}

export default Agents
