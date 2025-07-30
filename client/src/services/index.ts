import { ClientConfig } from './config'

export interface ConsoleLine {
  has_error: boolean
  message: string
}

export interface Scaffold {
  aegisPath: string | undefined
  setupAegisPath: () => void
  worlds: string[]
  agents: string[]
  output: ConsoleLine[]
  startSimulation: (
    rounds: string,
    amount: string,
    world: string,
    agent: string,
    debug: boolean
  ) => void
  killSim: (() => void) | undefined
  readAegisConfig: () => Promise<ClientConfig>
  refreshWorldsAndAgents: () => Promise<void>
  getConfigValue: (path: string) => any
  getConfig: () => ClientConfig | null
  isAssignmentConfig: () => boolean
  getDefaultAgentAmount: () => number
  isMultiAgentEnabled: () => boolean
}

export * from './aegis-api'
export * from './config'
export { createScaffold } from './scaffold'
export * from './websocket'
