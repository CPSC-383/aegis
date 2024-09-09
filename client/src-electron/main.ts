import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { is } from '@electron-toolkit/utils'
import path = require('path')
import fs = require('fs')
import child_process = require('child_process')

let mainWindow: BrowserWindow | undefined

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        // resizable: false,
        autoHideMenuBar: true,
        webPreferences: {
            devTools: is.dev,
            preload: path.join(__dirname, '../preload/index.js')
        }
    })
    const URL = is.dev ? 'http://localhost:5173' : `file://${path.join(__dirname, '../renderer/index.html')}`

    mainWindow.loadURL(URL)
    mainWindow.once('ready-to-show', () => mainWindow?.show())
    mainWindow.on('closed', () => {
        mainWindow = undefined
    })
}

app.whenReady().then(() => {
    createWindow()

    // open app again on mac if not fully closed
    app.on('activate', () => {
        if (mainWindow === undefined) {
            createWindow()
        }
    })

    app.on('before-quit', () => {
        kill()
    })

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit()
        }
    })
})

const processes = new Map()
function kill() {
    while (processes.size > 0) {
        const pid = processes.keys().next().value
        processes.get(pid).kill()
        processes.delete(pid)
    }
}
// Need to check mac since the built in version in /usr/bin is using python 3.9
// So we need to use the one in /usr/local/bin installed from the python website.
//
// Also check if someone is using venv (not the best way but it works)
const venvPath = process.env.VIRTUAL_ENV
const isUsingVenv = !!venvPath

let pythonExec = 'python3'
let pythonFolder = 'bin'

if (process.platform === 'win32') {
    pythonExec = 'python'
    pythonFolder = 'Scripts'
} else if (process.platform === 'darwin' && !isUsingVenv) {
    pythonExec = '/usr/local/bin/python3'
}

const PYTHON_EXEC = isUsingVenv ? path.join(venvPath, pythonFolder, pythonExec) : pythonExec

ipcMain.handle('electronAPI', async (event, command, ...args) => {
    switch (command) {
        case 'openAegisDirectory':
            const result = await dialog.showOpenDialog({
                properties: ['openDirectory'],
                title: 'Select Aegis directory'
            })

            return result.canceled ? undefined : result.filePaths[0]
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
        case 'fs.readFileSync':
            return fs.readFileSync(args[0], 'utf8')
        case 'exportWorld':
            const exportResult = await dialog.showSaveDialog({
                defaultPath: args[0],
                title: 'Export World'
            })
            if (!exportResult.canceled) {
                fs.writeFileSync(exportResult.filePath, args[1])
            }
            return
        case 'aegis_child_process.spawn':
            const rootPath = args[0]
            const numOfRounds = args[1]
            const numOfAgents = args[2]
            const worldFile = args[3]
            const srcPath = path.join(rootPath, 'src')
            const proc = path.join(srcPath, 'aegis', 'main.py')
            const procArgs = [
                '-NoKViewer',
                numOfAgents,
                '-ProcFile',
                'replay.txt',
                '-WorldFile',
                `worlds/${worldFile}`,
                '-NumRound',
                numOfRounds,
                '-WaitForClient',
                'true'
            ]
            const options = { cwd: rootPath, env: { PYTHONPATH: srcPath } }

            const childAegis = child_process.spawn((command = PYTHON_EXEC), [proc, ...procArgs], options)
            processes.set(childAegis.pid?.toString(), childAegis)

            return new Promise(async (resolve, reject) => {
                childAegis.on('error', reject)
                childAegis.on('spawn', () => {
                    childAegis.stdout.on('data', (data) => {
                        event.sender.send('aegis_child_process.stdout', data.toString())
                    })

                    childAegis.stderr.on('data', (data) => {
                        event.sender.send('aegis_child_process.stderr', data.toString())
                    })

                    childAegis.on('close', () => {
                        processes.delete(childAegis.pid?.toString())
                        event.sender.send('aegis_child_process.exit')
                    })
                    resolve(childAegis.pid?.toString())
                })
            })
        case 'agent_child_process.spawn':
            const rootPathAgent = args[0]
            const groupName = args[1]
            const numOfAgentsToSpawn = args[2]
            const agent = args[3]
            const srcPathAgent = path.join(rootPathAgent, 'src')
            const procAgent = path.join(srcPathAgent, 'agents', agent, 'main.py')
            const procArgsAgent = [groupName]
            const optionsAgent = { cwd: rootPathAgent, env: { PYTHONPATH: srcPathAgent } }

            const spawnPromises: Promise<{ code: number | null }>[] = []
            for (let i = 0; i < numOfAgentsToSpawn; i++) {
                const childAgent = child_process.spawn(
                    (command = PYTHON_EXEC),
                    [procAgent, ...procArgsAgent],
                    optionsAgent
                )
                processes.set(childAgent.pid?.toString(), childAgent)

                const spawnPromise = new Promise<{ code: number | null }>(async (resolve, reject) => {
                    childAgent.on('error', reject)
                    childAgent.on('spawn', () => {
                        childAgent.stdout.on('data', (data) => {
                            event.sender.send('agent_child_process.stdout', data.toString())
                        })

                        childAgent.stderr.on('data', (data) => {
                            event.sender.send('agent_child_process.stderr', data.toString())
                        })

                        childAgent.on('close', (code) => {
                            processes.delete(childAgent.pid?.toString())
                            resolve({ code })
                        })
                    })
                })
                spawnPromises.push(spawnPromise)
            }
            return Promise.all(spawnPromises)
        case 'aegis_child_process.kill':
            const pid = args[0]
            if (processes.has(pid)) processes.get(pid).kill()
            return
    }
})
