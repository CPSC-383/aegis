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
        spawn: (...args: any[]) => invoke('aegis_child_process.spawn', ...args),
        kill: (...args: any[]) => invoke('aegis_child_process.kill', ...args),
        onStdout: (callback: any) => {
            ipcRenderer.on('aegis_child_process.stdout', (_, data) => {
                callback(data)
            })
        },
        onStderr: (callback: any) => {
            ipcRenderer.on('aegis_child_process.stderr', (_, data) => {
                callback(data)
            })
        },
        onExit: (callback: any) => {
            ipcRenderer.on('aegis_child_process.exit', () => {
                callback()
            })
        }
    }
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)
