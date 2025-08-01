import { is } from '@electron-toolkit/utils'
import child_process from 'child_process'
import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import fs from 'fs'
import path from 'path'
import { l } from 'vite/dist/node/types.d-aGj9QkWt'
import yaml from 'yaml'

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

    const URL = is.dev
      ? 'http://localhost:5173'
      : `file://${path.join(__dirname, '../renderer/index.html')}`

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

    ipcMain.handle('aegis_child_process.spawn', async (_, ...args) => {
      return await this.spawnAegisProcess(
        args[0], // rounds
        args[1], // amount
        args[2], // world
        args[3], // agent
        args[4], // aegis path
        args[5] // debug
      )
    })

    ipcMain.handle('aegis_child_process.kill', async (_, pid) => {
      this.killProcess(pid)
    })

    ipcMain.handle('read_config', async (_, aegisPath) => {
      return this.readConfig(aegisPath)
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
          args[0], // rounds
          args[1], // amount
          args[2], // world
          args[3], // agent
          args[4], // aegis path
          args[5] // debug
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

  private readConfig(aegisPath: string) {
    try {
      const configPath = path.join(aegisPath, 'config', 'config.yaml')
      const fileContent = fs.readFileSync(configPath, 'utf8')
      const config = yaml.parse(fileContent) as Record<string, any>
      return config
    } catch (error) {
      console.error(`Error reading the config file: ${error}`)
      // Return default config if file can't be read
      return {
        features: {
          ENABLE_PREDICTIONS: false,
          ENABLE_VARIABLE_AGENT_AMOUNT: false,
          DEFAULT_AGENT_AMOUNT: 1
        },
        assignment_specific: {
          ENABLE_MOVE_COST: false
        },
        competition_specific: {
          VERSUS_MODE: false
        },
        client: {
          CONFIG_TYPE: 'assignment',
          SHOW_DEBUG_MODE: true,
          SHOW_MULTI_AGENT_OPTIONS: false
        }
      }
    }
  }

  // private updateConfig(filePath: string, updates: any) {
  //   try {
  //     const config = this.readConfig(filePath) as Record<string, any>
  //
  //     // Handle nested updates (like assignment_specific.ENABLE_MOVE_COST)
  //     for (const [key, value] of Object.entries(updates)) {
  //       if (typeof value === 'object' && value !== null) {
  //         // Handle nested objects
  //         if (!config[key]) {
  //           config[key] = {}
  //         }
  //         Object.assign(config[key], value)
  //       } else {
  //         // Handle direct properties
  //         config[key] = value
  //       }
  //     }
  //
  //     fs.writeFileSync(filePath, yaml.stringify(config))
  //   } catch (error) {
  //     // @ts-ignore: error type
  //     console.error(`Error updating the config file: ${error.message}`)
  //     throw error
  //   }
  // }

  private spawnAegisProcess(
    rounds: string,
    amount: string,
    world: string[],
    agent: string,
    aegisPath: string,
    debug: boolean
  ) {
    const procArgs = [
      '--amount',
      amount,
      '--agent',
      `${agent}`,
      '--world',
      ...world,
      '--rounds',
      rounds,
      '--client',
      ...(debug ? ['--debug'] : [])
    ]
    const childAegis = child_process.spawn('aegis', [...procArgs], { cwd: aegisPath })

    return new Promise((resolve, reject) => {
      childAegis.on('error', reject)
      childAegis.on('spawn', () => {
        const pid = childAegis.pid?.toString()
        if (pid) {
          this.processes.set(pid, childAegis)


          let stdoutBuffer = ''
          let stderrBuffer = ''

          function flushBuffer(buffer: string, data: string) {
            buffer += data
            const lines = buffer.split("\n")
            buffer = lines.pop() ?? ''
            return { lines, buffer }
          }

          childAegis.stdout?.on('data', (data) => {
            const { lines, buffer } = flushBuffer(stdoutBuffer, data.toString())
            stdoutBuffer = buffer
            lines.forEach((line) => {
              this.mainWindow?.webContents.send('aegis_child_process.stdout', line)
            })
          })

          childAegis.stderr?.on('data', (data) => {
            const { lines, buffer } = flushBuffer(stdoutBuffer, data.toString())
            stderrBuffer = buffer
            lines.forEach((line) => {
              this.mainWindow?.webContents.send('aegis_child_process.stderr', line)
            })
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

  private killProcess(pid: string) {
    const process = this.processes.get(pid)
    if (process) {
      process.kill()
      this.processes.delete(pid)
    }
  }
}

new ElectronApp()
