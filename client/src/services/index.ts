export interface ConsoleLine {
  has_error: boolean
  message: string
}

export interface Scaffold {
  aegisPath: string | undefined
  setupAegisPath: () => void
  worlds: string[]
  agents: string[]
  configPresets: string[]
  output: ConsoleLine[]
  startSimulation: (
    rounds: string,
    amount: string,
    world: string,
    agent: string,
    config: string,
    debug: boolean
  ) => void
  killSim: (() => void) | undefined
  readAegisConfig: () => Promise<string>
  refreshConfigPresets: () => Promise<void>
  refreshWorldsAndAgents: () => Promise<void>
}

export { createScaffold } from './scaffold'
export * from './websocket'
export * from './aegis-api'
