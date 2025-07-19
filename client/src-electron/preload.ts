import { contextBridge, ipcRenderer } from 'electron'

const invoke = (command: string, ...args: any[]) => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await ipcRenderer.invoke('electronAPI', command, ...args)
      resolve(result)
    } catch (error) {
      reject(resolve)
    }
  })
}

const electronAPI = {
  openAegisDirectory: () => invoke('openAegisDirectory'),
  toggleMoveCost: (...args: any[]) => invoke('toggleMoveCost', ...args),
  getAppPath: (...args: any[]) => invoke('getAppPath', ...args),
  exportWorld: (...args: any[]) => invoke('exportWorld', ...args),
  path: {
    join: (...args: any[]) => invoke('path.join', ...args),
    dirname: (...args: any[]) => invoke('path.dirname', ...args)
  },
  fs: {
    existsSync: (...args: any[]) => invoke('fs.existsSync', ...args),
    readdirSync: (...args: any[]) => invoke('fs.readdirSync', ...args),
    readFileSync: (...args: any[]) => invoke('fs.readFileSync', ...args),
    isDirectory: (...args: any[]) => invoke('fs.isDirectory', ...args)
  },
  aegis_child_process: {
    spawn: (
      rounds: string,
      amount: string,
      world: string,
      group: string,
      agent: string,
      aegisPath: string,
      config: string,
      debug: boolean
    ) =>
      ipcRenderer.invoke(
        'aegis_child_process.spawn',
        rounds,
        amount,
        world,
        group,
        agent,
        aegisPath,
        config,
        debug
      ),
    kill: (pid: string) => ipcRenderer.invoke('aegis_child_process.kill', pid),
    onStdout: (callback: (data: string) => void) =>
      ipcRenderer.on('aegis_child_process.stdout', (event, data) => callback(data)),
    onStderr: (callback: (data: string) => void) =>
      ipcRenderer.on('aegis_child_process.stderr', (event, data) => callback(data)),
    onExit: (callback: () => void) =>
      ipcRenderer.on('aegis_child_process.exit', () => callback())
  },

  read_config_presets: (aegisPath: string, context?: string) =>
    ipcRenderer.invoke('read_config_presets', aegisPath, context)
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)
