import { aegisAPI } from '@/aegis-api'
import { Simulation } from '@/simulation/simulation'
import { WorldMap } from '@/simulation/world-map'
import { SpawnZoneTypes } from '@/utils/types'

export async function importWorld(file: File): Promise<Simulation> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string
                const data = JSON.parse(content)
                const world = WorldMap.fromData(data)
                const sim = new Simulation(world)
                resolve(sim)
            } catch (error) {
                reject('Error parsing world! Make sure it is valid JSON.')
            }
        }

        reader.onerror = () => {
            reject('Error reading the file.')
        }

        reader.readAsText(file)
    })
}

export async function exportWorld(worldMap: WorldMap, worldName: string) {
    const errMsg = validateMap(worldMap)
    if (errMsg) return errMsg

    const world = createWorld(worldMap)
    const stringWorld = JSON.stringify(world, null, 2)
    const aegisPath = localStorage.getItem('aegisPath')!
    const fullName = worldName + '.world'
    const fullPath = await aegisAPI.path.join(aegisPath, 'worlds', fullName)
    aegisAPI.exportWorld(fullPath, stringWorld)
    return null
}

const validateMap = (world: WorldMap) => {
    if (world.spawnCells.size === 0) return 'Missing spawn zones!'

    let hasAnyZone = false

    // Validate spawn zones
    for (const [key, data] of world.spawnCells) {
        const coord = JSON.parse(key)
        if (data.type === SpawnZoneTypes.Group && data.groups.length === 0) {
            return `Group spawn zone at (${coord.x}, ${coord.y}) is missing a group ID!`
        }

        if (data.type === SpawnZoneTypes.Any) hasAnyZone = true
    }

    if (!hasAnyZone) return "Missing at least 1 'Any' spawn zone!"

    const hasSurvivors = world.stacks.some((stack) =>
        stack.contents.some((content) => content.type === 'sv' || content.type === 'svg')
    )

    if (!hasSurvivors) return 'Missing at least 1 survivor!'

    return ''
}

const createWorld = (world: WorldMap) => {
    const spawn_locs = Array.from(world.spawnCells, ([spawn, data]) => {
        const { x, y } = JSON.parse(spawn)

        if (data.groups.length === 0) {
            return { x, y, type: data.type }
        }

        return data.groups.map((gid) => ({
            x,
            y,
            gid,
            type: data.type
        }))
    }).flat()

    return {
        settings: {
            world_info: {
                size: {
                    width: world.size.width,
                    height: world.size.height
                },
                seed: world.seed !== 0 ? world.seed : Math.floor(Math.random() * 10000),
                world_file_levels: {
                    high: world.high !== 0 ? world.high : 11 + Math.floor(Math.random() * 5),
                    mid: world.mid !== 0 ? world.mid : 6 + Math.floor(Math.random() * 5),
                    low: world.low !== 0 ? world.low : 1 + Math.floor(Math.random() * 5)
                },
                agent_energy: world.initialAgentEnergy
            }
        },
        spawn_locs,
        cell_types: {
            fire_cells: world.fireCells,
            killer_cells: world.killerCells,
            charging_cells: world.chargingCells
        },
        stacks: world.stacks
    }
}
