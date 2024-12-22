import { useMemo } from 'react'
import { motion } from 'framer-motion'

import { aegisAPI } from '@/services'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ASSIGNMENT_A1, getCurrentAssignment } from '@/utils/util'

interface Props {
    aegisPath: string
    agents: string[]
    agent: string
    setAgent: (value: string) => void
    groupName: string
    setGroupName: (value: string) => void
}

function Agents({ aegisPath, agents, agent, setAgent, groupName, setGroupName }: Props) {
    const isButtonDisabled = useMemo(() => !groupName || !agent, [groupName, agent])

    const handleGroupName = (value: string) => {
        // don't allow space characters
        setGroupName(value.replace(/\s/g, ''))
    }

    const handleConnectAgents = async () => {
        if (!aegisPath) {
            throw new Error("Can't find AEGIS path!")
        }

        await aegisAPI.agent_child_process.spawn(
            aegisPath,
            groupName.toString(),
            getCurrentAssignment() === ASSIGNMENT_A1 ? '1' : '7',
            agent
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full"
        >
            <div className="space-y-4">
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
                    <Input
                        value={groupName}
                        onChange={(e) => handleGroupName(e.target.value)}
                        placeholder="Enter group name"
                    />
                </div>

                <Button onClick={handleConnectAgents} disabled={isButtonDisabled} className="w-full">
                    Connect Agents
                </Button>
            </div>
        </motion.div>
    )
}

export default Agents
