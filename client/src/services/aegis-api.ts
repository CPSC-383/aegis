type AegisAPI = {
    openAegisDirectory: () => Promise<string | undefined>
    toggleMoveCost: (config_path: string, value: boolean) => void
    getAppPath: () => Promise<string>
    exportWorld: (name: string, world: string) => Promise<void>
    path: {
        join: (...args: string[]) => Promise<string>
        dirname: (dir: string) => Promise<string>
    }
    fs: {
        existsSync: (arg: string) => Promise<boolean>
        readdirSync: (arg: string) => Promise<string[]>
        readFileSync: (arg: string) => Promise<string>
        isDirectory: (arg: string) => Promise<boolean>
    }
    aegis_child_process: {
        spawn: (aegisPath: string, numOfRounds: string, numOfAgents: string, worldFile: string) => Promise<string>
        kill: (aegisPid: string) => void
        onStdout: (callback: (data: string) => void) => void
        onStderr: (callback: (data: string) => void) => void
        onExit: (callback: () => void) => void
    }
    agent_child_process: {
        spawn: (agentPath: string, groupName: string, numOfAgents: string, agent: string) => Promise<string>
        onStdout: (callback: (data: string) => void) => void
        onStderr: (callback: (data: string) => void) => void
    }
}

// @ts-ignore
export const aegisAPI: AegisAPI = window.electronAPI as ElectronAPI
