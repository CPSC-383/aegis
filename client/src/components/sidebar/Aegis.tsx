import { motion } from 'framer-motion'
import { useEffect, useMemo } from 'react'

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
  const {
    worlds,
    agents,
    configPresets,
    startSimulation,
    killSim,
    refreshWorldsAndAgents
  } = scaffold
  const [world, setWorld] = useLocalStorage<string>('aegis_world', '')
  const [rounds, setRounds] = useLocalStorage<number>('aegis_rounds', 0)
  const [agent, setAgent] = useLocalStorage<string>('aegis_agent', '')
  const [config, setConfig] = useLocalStorage<string>('aegis_config', '')
  const [debug] = useLocalStorage<boolean>('aegis_debug_mode', false)

  // Refresh worlds and agents when component mounts (when switching to this tab)
  useEffect(() => {
    refreshWorldsAndAgents()
  }, [])

  useEffect(() => {
    const storedWorld = localStorage.getItem('aegis_world')
    if (storedWorld) {
      const worldName = JSON.parse(storedWorld)
      if (worldName && !worlds.includes(worldName)) {
        setWorld('')
      }
    }

    const storedAgent = localStorage.getItem('aegis_agent')
    if (storedAgent) {
      const agentName = JSON.parse(storedAgent)
      if (agentName && !agents.includes(agentName)) {
        setAgent('')
      }
    }
  }, [worlds, agents, setWorld, setAgent])

  const isButtonDisabled = useMemo(
    () => !world || !rounds || !agent || !config,
    [world, rounds, agent, config]
  )

  const handleRoundBlur = (e: React.FocusEvent<HTMLInputElement>): void => {
    const value = parseInt(e.target.value)
    if (!isNaN(value)) {
      const newValue = Math.max(1, value)
      setRounds(newValue)
    }
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
