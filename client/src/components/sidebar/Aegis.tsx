import { motion } from 'framer-motion'
import { useMemo } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { Scaffold } from '@/services'
import { ASSIGNMENT_A1, getCurrentAssignment } from '@/utils/util'

type Props = {
  scaffold: Scaffold
}

const Aegis = ({ scaffold }: Props): JSX.Element => {
  const { worlds, agents, configPresets, startSimulation, killSim } = scaffold
  const [world, setWorld] = useLocalStorage<string>('aegis_world', '')
  const [rounds, setRounds] = useLocalStorage<number>('aegis_rounds', 0)
  const [group, setGroup] = useLocalStorage<string>('aegis_group', '')
  const [agent, setAgent] = useLocalStorage<string>('aegis_agent', '')
  const [config, setConfig] = useLocalStorage<string>('aegis_config', '')
  const [debug] = useLocalStorage<boolean>('aegis_debug_mode', false)

  const isButtonDisabled = useMemo(
    () => !world || !rounds || !group || !agent || !config,
    [world, rounds, group, agent, config]
  )

  const handleRoundBlur = (e: React.FocusEvent<HTMLInputElement>): void => {
    const value = parseInt(e.target.value)
    if (!isNaN(value)) {
      const newValue = Math.max(1, value)
      setRounds(newValue)
    }
  }

  const handleGroupName = (value: string): void => {
    // don't allow space characters
    setGroup(value.replace(/\s/g, ''))
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full space-y-4"
    >
      <div>
        <Label>Select a World</Label>
        <Select value={world} onValueChange={(value) => setWorld(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a world">
              {world || 'Select a world'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {worlds.map((worldName) => (
              <SelectItem key={worldName} value={worldName}>
                {worldName}
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
          onChange={(e) => setRounds(parseInt(e.target.value) || 0)}
          onBlur={handleRoundBlur}
          placeholder="Enter number of rounds"
        />
      </div>

      <div>
        <Label>Select an Agent</Label>
        <Select value={agent} onValueChange={(value) => setAgent(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Choose an agent">
              {agent || 'Select an agent'}
            </SelectValue>
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
          value={group}
          onChange={(e) => handleGroupName(e.target.value)}
          placeholder="Enter group name"
        />
      </div>

      <div>
        <Label>Config Preset</Label>
        <Select value={config} onValueChange={(value) => setConfig(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a config preset">
              {config || 'Select a config preset'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {configPresets.map((configName) => (
              <SelectItem key={configName} value={configName}>
                {configName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
              startSimulation(
                rounds.toString(),
                amount.toString(),
                world,
                group,
                agent,
                config,
                debug
              )
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
