import { motion } from "framer-motion"
import { useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { ASSIGNMENT_A1, getCurrentAssignment } from "@/utils/util"
import NumberInput from "../NumberInput"
import { MultiSelect } from "../ui/multiselect"
import { Scaffold } from "@/types"
import GameCycler from "../GameCycler"
import { ClientConfig } from "@/services"

type Props = {
  scaffold: Scaffold
}

const Aegis = ({ scaffold }: Props): JSX.Element => {
  const {
    worlds,
    agents,
    startSimulation,
    killSim,
    refreshWorldsAndAgents,
    readAegisConfig,
    getDefaultAgentAmount,
    isMultiAgentEnabled,
  } = scaffold
  const [selectedWorlds, setSelectedWorlds] = useState<string[]>([])
  const [rounds, setRounds] = useLocalStorage<number>("aegis_rounds", 0)
  const [agent, setAgent] = useLocalStorage<string>("aegis_agent", "")
  const [agentAmount, setAgentAmount] = useLocalStorage<number>("aegis_agent_amount", 1)
  const [debug] = useLocalStorage<boolean>("aegis_debug_mode", false)
  const [configError, setConfigError] = useState<string | null>(null)

  // Refresh worlds and agents when component mounts (when switching to this tab)
  useEffect(() => {
    refreshWorldsAndAgents()
    loadConfig()
  }, [])

  const loadConfig = async (): Promise<ClientConfig | undefined> => {
    try {
      setConfigError(null)
      const config = await readAegisConfig()
      return config
    } catch (error) {
      setConfigError(
        error instanceof Error
          ? error.message
          : "Failed to load config. Please check your config.yaml file, and make sure it is in the correct path."
      )
      return undefined
    }
  }

  // useEffect(() => {
  //   const storedWorld = localStorage.getItem('aegis_world')
  //   if (storedWorld) {
  //     const worldName = JSON.parse(storedWorld)
  //     if (worldName && !worlds.includes(worldName)) {
  //       setWorld('')
  //     }
  //   }
  //
  //   const storedAgent = localStorage.getItem('aegis_agent')
  //   if (storedAgent) {
  //     const agentName = JSON.parse(storedAgent)
  //     if (agentName && !agents.includes(agentName)) {
  //       setAgent('')
  //     }
  //   }
  // }, [worlds, agents, setWorld, setAgent])

  // Update agent amount when config changes
  useEffect(() => {
    const defaultAmount = getDefaultAgentAmount()
    if (defaultAmount !== agentAmount) {
      setAgentAmount(defaultAmount)
    }
  }, [getDefaultAgentAmount])

  const isButtonDisabled = useMemo(
    () => !selectedWorlds.length || !rounds || !agent || configError !== null,
    [selectedWorlds, rounds, agent, configError]
  )

  const showMultiAgentOptions = isMultiAgentEnabled()

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full space-y-4"
    >
      {configError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Config Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{configError}</p>
              </div>
              <div className="mt-4">
                <Button type="button" variant="outline" size="sm" onClick={loadConfig}>
                  Retry Load Config
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <Label className="text-xs text-muted-foreground">Worlds</Label>
        <MultiSelect
          options={worlds}
          selected={selectedWorlds}
          onChange={setSelectedWorlds}
        />
      </div>

      <div>
        <Label htmlFor="rounds" className="text-xs text-muted-foreground">
          Number of Rounds
        </Label>
        <NumberInput
          name="rounds"
          value={rounds}
          min={1}
          max={1000}
          onChange={(_, val) => setRounds(val)}
        />
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">Agent</Label>
        <Select value={agent} onValueChange={(value) => setAgent(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Choose an agent">
              {agent || "Select an agent"}
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

      {showMultiAgentOptions && (
        <div>
          <Label>Number of Agents</Label>
          <Input
            type="number"
            value={agentAmount}
            onChange={(e) => setAgentAmount(parseInt(e.target.value) || 1)}
            placeholder="Enter number of agents"
            min={1}
          />
        </div>
      )}

      <div className="flex flex-col mt-4">
        {killSim ? (
          <Button variant="destructive" onClick={killSim}>
            Kill Game
          </Button>
        ) : (
          <Button
            onClick={() => {
              const amount = getCurrentAssignment() === ASSIGNMENT_A1 ? 1 : agentAmount
              startSimulation(
                rounds.toString(),
                amount.toString(),
                selectedWorlds,
                agent,
                debug
              )
            }}
            disabled={isButtonDisabled}
            className={`${isButtonDisabled ? "cursor-not-allowed" : ""}`}
          >
            Start Up Game
          </Button>
        )}
      </div>
      <GameCycler />
    </motion.div>
  )
}

export default Aegis
