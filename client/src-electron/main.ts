import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { is } from '@electron-toolkit/utils'
import path from 'path'
import fs from 'fs'
import child_process from 'child_process'
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
        args[5], // config
        args[6] // debug
      )
    })

    ipcMain.handle('aegis_child_process.kill', async (_, pid) => {
      this.killProcess(pid)
    })

    ipcMain.handle('read_config_presets', async (_, aegisPath, context) => {
      return this.readConfigPresets(aegisPath, context)
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
          args[0], // rounds
          args[1], // amount
          args[2], // world
          args[3], // agent
          args[4], // aegis path
          args[5], // config
          args[6] // debug
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

  private readConfig(filePath: string) {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8')
      const config = yaml.parse(fileContent) as Record<string, any>
      return config
    } catch (error) {
      // @ts-ignore: error type
      console.error(`Error reading the config file: ${error.message}`)
      throw error
    }
  }
  private updateConfig(filePath: string, updates: any) {
    // TODO: Decide if we want to allow the client to edit the config file once it lives away from the system?
    try {
      const config = this.readConfig(filePath) as Record<string, any>
      Object.assign(config, updates)
      fs.writeFileSync(filePath, yaml.stringify(config))
    } catch (error) {
      // @ts-ignore: error type
      console.error(`Error updating the config file: ${error.message}`)
      throw error
    }
  }

  private spawnAegisProcess(
    rounds: string,
    amount: string,
    world: string,
    agent: string,
    aegisPath: string,
    config: string,
    debug: boolean
  ) {
    const procArgs = [
      '--amount',
      amount,
      '--agent2',
      `agents/${agent}/main.py`,
      '--world',
      `worlds/${world}`,
      '--rounds',
      rounds,
      '--config',
      config,
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

          childAegis.stdout?.on('data', (data) => {
            this.mainWindow?.webContents.send(
              'aegis_child_process.stdout',
              data.toString()
            )
          })

          childAegis.stderr?.on('data', (data) => {
            this.mainWindow?.webContents.send(
              'aegis_child_process.stderr',
              data.toString()
            )
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

  private readConfigPresets(aegisPath: string, context: string = 'all') {
    try {
      const presetsDir = path.join(aegisPath, 'config', 'presets')
      if (!fs.existsSync(presetsDir)) {
        return []
      }

      // Read metadata file to determine visibility
      const metadataPath = path.join(presetsDir, 'metadata.yaml')
      let metadata: any = {}

      if (fs.existsSync(metadataPath)) {
        const metadataContent = fs.readFileSync(metadataPath, 'utf8')
        metadata = yaml.parse(metadataContent)
      }

      const files = fs.readdirSync(presetsDir)
      const yamlFiles = files.filter(
        (file) => file.endsWith('.yaml') && file !== 'metadata.yaml'
      )
      const allPresets = yamlFiles.map((file) => file.replace('.yaml', ''))

      // If context is 'all', return all presets
      if (context === 'all') {
        return allPresets
      }

      // Filter presets based on metadata
      const visiblePresets = allPresets.filter((preset) => {
        const presetMetadata = metadata.presets?.[preset]
        if (!presetMetadata || !presetMetadata.visible_for) {
          return false // Default to not visible if no metadata
        }
        return presetMetadata.visible_for.includes(context)
      })

      return visiblePresets
    } catch (error) {
      console.error(`Error reading config presets: ${error}`)
      return []
    }
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
