type AegisAPI = {
  openAegisDirectory: () => Promise<string | undefined>
  getAppPath: () => Promise<string>
  exportWorld: (name: string, world: Uint8Array) => Promise<void>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  read_config: (aegisPath: string) => Promise<any>
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
    spawn: (
      rounds: string,
      amount: string,
      world: string[],
      agent: string,
      aegisPath: string,
      debug: boolean
    ) => Promise<string>
    kill: (aegisPid: string) => void
    onStdout: (callback: (data: string) => void) => void
    onStderr: (callback: (data: string) => void) => void
    onExit: (callback: () => void) => void
  }
}

// @ts-ignore ignore type cast thing
export const aegisAPI: AegisAPI = window.electronAPI as ElectronAPI
