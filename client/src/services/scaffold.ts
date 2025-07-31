import Game from '@/core/Game'
import Games from '@/core/Games'
import { Runner } from '@/core/Runner'
import { ClientWebSocket, aegisAPI } from '@/services'
import { useAppStore } from '@/store/useAppStore'
import { ConsoleLine, Scaffold } from '@/types'
import { useForceUpdate } from '@/utils/util'
import { useEffect, useRef, useState } from 'react'
import invariant from 'tiny-invariant'
import {
  ClientConfig,
  getConfigValue as getDynamicConfigValue,
  parseClientConfig
} from './config'

export function createScaffold(): Scaffold {
  const [aegisPath, setAegisPath] = useState<string | undefined>(undefined)
  const [worlds, setWorlds] = useState<string[]>([])
  const [agents, setAgents] = useState<string[]>([])
  const [output, setOutput] = useState<ConsoleLine[]>([])
  const [config, setConfig] = useState<ClientConfig | null>(null)
  const [rawConfigData, setRawConfigData] = useState<any>(null)
  const aegisPid = useRef<string | undefined>(undefined)
  const forceUpdate = useForceUpdate()

  const addOutput = (line: ConsoleLine) => {
    console.log(line.content)
    // const splitData = data.split('\n')
    // const formattedData = splitData.map((line) => ({ has_error, message: line, gameIdx: 0 }))
    //
    // console.log(formattedData)
    // setOutput((prevOutput) => prevOutput.concat(formattedData))
  }

  const setupAegisPath = async () => {
    const path = await aegisAPI!.openAegisDirectory()
    if (path) setAegisPath(path)
  }

  const startSimulation = async (
    rounds: string,
    amount: string,
    worlds: string[],
    agent: string,
    debug: boolean
  ): Promise<void> => {
    invariant(aegisPath, "Can't find AEGIS path!")
    invariant(config, 'Config not loaded. Please ensure config.yaml is valid.')

    // Reset output
    setOutput([])

    const pid = await aegisAPI.aegis_child_process.spawn(
      rounds,
      amount,
      worlds,
      agent,
      aegisPath,
      debug
    )
    aegisPid.current = pid
    forceUpdate()
  }

  const readAegisConfig = async (): Promise<ClientConfig> => {
    invariant(aegisPath, "Can't find AEGIS path!")

    try {
      const rawConfig = (await aegisAPI.read_config(aegisPath)) as any
      setRawConfigData(rawConfig)

      const parsedConfig = parseClientConfig(rawConfig)
      setConfig(parsedConfig)
      return parsedConfig
    } catch (error) {
      console.error('Error reading config:', error)
      setConfig(null)
      setRawConfigData(null)
      throw new Error(`Failed to load config.yaml: ${error}`)
    }
  }

  const getConfigValue = (path: string): unknown => {
    if (!rawConfigData) return null
    return getDynamicConfigValue(rawConfigData, path)
  }

  const getConfig = (): ClientConfig | null => {
    return config
  }

  const isAssignmentConfig = (): boolean => {
    return config?.configType === 'assignment'
  }

  const getDefaultAgentAmount = (): number => {
    return config?.defaultAgentAmount || 1
  }

  const isMultiAgentEnabled = (): boolean => {
    return config?.variableAgentAmount || false
  }

  const refreshWorldsAndAgents = async () => {
    if (!aegisPath) return

    const [worldsData, agentsData] = await Promise.all([
      getWorlds(aegisPath),
      getAgents(aegisPath)
    ])

    setWorlds(worldsData)
    setAgents(agentsData)
  }

  const killSimulation = () => {
    if (!aegisPid.current) return
    aegisAPI.aegis_child_process.kill(aegisPid.current)
    aegisPid.current = undefined
    forceUpdate()
  }

  useEffect(() => {
    getAegisPath().then((path) => {
      setAegisPath(path)
    })

    aegisAPI.aegis_child_process.onStdout((data: string) => {
      addOutput({ content: data, has_error: false, gameIdx: 0 })
    })

    aegisAPI.aegis_child_process.onStderr((data: string) => {
      addOutput({ content: data, has_error: true, gameIdx: 0 })
    })

    aegisAPI.aegis_child_process.onExit(() => {
      aegisPid.current = undefined
      forceUpdate()
    })

    const onGamesCreated = (games: Games) => {
      useAppStore.getState().pushToQueue(games)
      Runner.setGames(games)
    }

    const onGameCreated = (game: Game) => {
      Runner.setGame(game)
    }
    new ClientWebSocket(onGameCreated, onGamesCreated)
  }, [])

  useEffect(() => {
    if (!aegisPath) return

    const loadData = async () => {
      const [worldsData, agentsData] = await Promise.all([
        getWorlds(aegisPath),
        getAgents(aegisPath)
      ])

      setWorlds(worldsData)
      setAgents(agentsData)

      await readAegisConfig()
    }

    loadData()
    localStorage.setItem('aegisPath', aegisPath)
  }, [aegisPath])

  return {
    aegisPath,
    setupAegisPath,
    worlds,
    agents,
    output,
    startSimulation,
    killSim: aegisPid.current ? killSimulation : undefined,
    readAegisConfig,
    refreshWorldsAndAgents,
    getConfigValue,
    getConfig,
    isAssignmentConfig,
    getDefaultAgentAmount,
    isMultiAgentEnabled
  }
}

const getAegisPath = async () => {
  const localPath = localStorage.getItem('aegisPath')
  if (localPath) return localPath

  let currentDir: string = await aegisAPI!.getAppPath()
  const fs = aegisAPI!.fs
  const path = aegisAPI!.path

  while (true) {
    const worldsDir = await path.join(currentDir, 'worlds')
    if (await fs.existsSync(worldsDir)) {
      return currentDir
    }

    currentDir = await path.dirname(currentDir)

    if (currentDir === (await path.dirname(currentDir))) {
      return undefined
    }
  }
}

const getWorlds = async (aegisPath: string) => {
  const fs = aegisAPI.fs
  const path = aegisAPI.path

  const worldsPath = await path.join(aegisPath, 'worlds')
  if (!(await fs.existsSync(worldsPath))) return []

  const worlds = await fs.readdirSync(worldsPath)
  const filtered_worlds = worlds
    .filter((world: string) => world.endsWith('.world'))
    .map((world: string) => world.replace(/\.world$/, ''))
  return filtered_worlds
}

const getAgents = async (aegisPath: string) => {
  const fs = aegisAPI.fs
  const path = aegisAPI.path

  const agentsPath = await path.join(aegisPath, 'agents')
  if (!(await fs.existsSync(agentsPath))) return []

  const agentsDirs = await fs.readdirSync(agentsPath)

  // Only take the agents that have 'main.py' in their folders
  const agents: string[] = []
  for (const agent of agentsDirs) {
    const agentPath = await path.join(agentsPath, agent)
    if (!(await fs.isDirectory(agentPath))) continue
    const agentFiles = await fs.readdirSync(agentPath)
    if (!agentFiles.includes('main.py')) continue
    agents.push(agent)
  }
  return agents
}
