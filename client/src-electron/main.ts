import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { is } from '@electron-toolkit/utils'
import path from 'path'
import fs from 'fs'
import child_process from 'child_process'

class ElectronApp {
    private mainWindow: BrowserWindow | null = null
    private processes = new Map<string, child_process.ChildProcess>()

    constructor() {
        this.initialize()
    }

    private initialize() {
        app.whenReady().then(() => {
            this.createWindow()
            this.setupAppLifecycleHandlers()
            this.setupIpcHandlers()
        })
    }

    private createWindow() {
        this.mainWindow = new BrowserWindow({
            width: 1200,
            height: 800,
            autoHideMenuBar: true,
            title: 'AEGIS',
            webPreferences: {
                devTools: is.dev,
                preload: path.join(__dirname, '../preload/index.js')
            }
        })

        const URL = is.dev ? 'http://localhost:5173' : `file://${path.join(__dirname, '../renderer/index.html')}`

        this.mainWindow.loadURL(URL)
        this.mainWindow.once('ready-to-show', () => this.mainWindow?.show())
        this.mainWindow.on('closed', () => {
            this.mainWindow = null
        })
    }

    private setupAppLifecycleHandlers() {
        app.on('activate', () => {
            if (this.mainWindow === null) this.createWindow()
        })

        app.on('before-quit', () => this.killAllProcesses())

        app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') app.quit()
        })
    }

    private setupIpcHandlers() {
        ipcMain.handle('electronAPI', async (_, command: string, ...args: any[]) => {
            return this.handleElectronAPI(command, ...args)
        })
    }

    private killAllProcesses() {
        for (const [pid, process] of this.processes) {
            process.kill()
            this.processes.delete(pid)
        }
    }

    private async handleElectronAPI(command: string, ...args: any[]) {
        switch (command) {
            case 'openAegisDirectory':
                return this.openAegisDirectory()
            case 'toggleMoveCost':
                const updates = { Enable_Move_Cost: args[1] }
                this.updateConfig(args[0], updates)
                return
            case 'getAppPath':
                return app.getAppPath()
            case 'path.join':
                return path.join(...args)
            case 'path.dirname':
                return path.dirname(args[0])
            case 'fs.existsSync':
                return fs.existsSync(args[0])
            case 'fs.readdirSync':
                return fs.readdirSync(args[0])
            case 'fs.isDirectory':
                return fs.statSync(args[0]).isDirectory()
            case 'fs.readFileSync':
                return fs.readFileSync(args[0], 'utf8')
            case 'exportWorld':
                return this.exportWorld(args[0], args[1])
            case 'aegis_child_process.spawn':
                return this.spawnAegisProcess(
                    args[0], // rootPath
                    args[1], // numOfRounds
                    args[2], // numOfAgents
                    args[3] // worldFile
                )
            case 'agent_child_process.spawn':
                return this.spawnAgentProcesses(
                    args[0], // rootPath
                    args[1], // groupName
                    args[2], // numOfAgentsToSpawn
                    args[3] // agent
                )
            case 'aegis_child_process.kill':
                return this.killProcess(args[0])
        }
    }

    private async openAegisDirectory() {
        const result = await dialog.showOpenDialog({
            properties: ['openDirectory'],
            title: 'Select Aegis directory'
        })
        return result.canceled ? undefined : result.filePaths[0]
    }

    private async exportWorld(defaultPath: string, content: string) {
        const exportResult = await dialog.showSaveDialog({
            defaultPath,
            title: 'Export World'
        })
        if (!exportResult.canceled && exportResult.filePath) {
            fs.writeFileSync(exportResult.filePath, content)
        }
    }

    private getPythonExecutablePath(rootPath: string) {
        const isWindows = process.platform === 'win32'
        const venvSubpath = isWindows ? path.join('.venv', 'Scripts', 'python') : path.join('.venv', 'bin', 'python')
        return path.join(rootPath, venvSubpath)
    }

    private readConfig(filePath: string) {
        try {
            const fileContent = fs.readFileSync(filePath, 'utf8')
            const config = JSON.parse(fileContent)
            return config
        } catch (error) {
            // @ts-ignore: error type
            console.error(`Error reading the config file: ${error.message}`)
            throw error
        }
    }
    private updateConfig(filePath: string, updates: any) {
        try {
            const config = this.readConfig(filePath)
            Object.assign(config, updates)
            fs.writeFileSync(filePath, JSON.stringify(config, null, 2))
        } catch (error) {
            // @ts-ignore: error type
            console.error(`Error updating the config file: ${error.message}`)
            throw error
        }
    }

    private spawnAegisProcess(rootPath: string, numOfRounds: string, numOfAgents: string, worldFile: string) {
        const srcPath = path.join(rootPath, 'src')
        const proc = path.join(srcPath, '_aegis', 'main.py')
        const procArgs = [
            '--agent-amount',
            numOfAgents,
            '--replay-file',
            'replay.txt',
            '--world-file',
            `worlds/${worldFile}`,
            '--rounds',
            numOfRounds,
            '--client'
        ]
        const options = {
            cwd: rootPath,
            env: { PYTHONPATH: srcPath }
        }

        const pythonExec = this.getPythonExecutablePath(rootPath)
        const childAegis = child_process.spawn(pythonExec, [proc, ...procArgs], options)

        return new Promise((resolve, reject) => {
            childAegis.on('error', reject)
            childAegis.on('spawn', () => {
                const pid = childAegis.pid?.toString()
                if (pid) {
                    this.processes.set(pid, childAegis)

                    childAegis.stdout?.on('data', (data) => {
                        this.mainWindow?.webContents.send('aegis_child_process.stdout', data.toString())
                    })

                    childAegis.stderr?.on('data', (data) => {
                        this.mainWindow?.webContents.send('aegis_child_process.stderr', data.toString())
                    })

                    childAegis.on('exit', () => {
                        this.processes.delete(pid)
                        this.mainWindow?.webContents.send('aegis_child_process.exit')
                    })

                    resolve(pid)
                }
            })
        })
    }

    private spawnAgentProcesses(rootPath: string, groupName: string, numOfAgentsToSpawn: number, agent: string) {
        const srcPath = path.join(rootPath, 'src')
        const proc = path.join(srcPath, '_agents', agent, 'main.py')
        const procArgs = [groupName]
        const options = {
            cwd: rootPath,
            env: { PYTHONPATH: srcPath }
        }

        const pythonExec = this.getPythonExecutablePath(rootPath)

        const spawnPromises = Array.from({ length: numOfAgentsToSpawn }, () => {
            return new Promise<{ code: number | null }>((resolve, reject) => {
                const childAgent = child_process.spawn(pythonExec, [proc, ...procArgs], options)

                childAgent.on('error', reject)
                childAgent.on('spawn', () => {
                    const pid = childAgent.pid?.toString()
                    if (pid) {
                        this.processes.set(pid, childAgent)

                        childAgent.stdout?.on('data', (data) => {
                            this.mainWindow?.webContents.send('agent_child_process.stdout', data.toString())
                        })

                        childAgent.stderr?.on('data', (data) => {
                            this.mainWindow?.webContents.send('agent_child_process.stderr', data.toString())
                        })

                        childAgent.on('close', (code) => {
                            this.processes.delete(pid)
                            resolve({ code })
                        })
                    }
                })
            })
        })

        return Promise.all(spawnPromises)
    }

    private killProcess(pid: string) {
        const process = this.processes.get(pid)
        if (process) {
            process.kill()
            this.processes.delete(pid)
        }
    }
}

new ElectronApp()
