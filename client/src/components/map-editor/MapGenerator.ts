import { aegisAPI } from '@/aegis-api'
import { Simulation } from '@/simulation/simulation'
import { WorldMap } from '@/simulation/world-map'
import { SpawnZoneTypes, Location, Stack, Spawn } from '@/utils/types'

interface WorldFileData {
    settings: {
        world_info: {
            size: {
                width: number
                height: number
            }
            seed: number
            world_file_levels: {
                high: number
                mid: number
                low: number
            }
            agent_energy: number
        }
    }
    spawn_locs: Spawn[]
    cell_types: {
        fire_cells: Location[]
        killer_cells: Location[]
        charging_cells: Location[]
    }
    stacks: Stack[]
}

class WorldValidator {
    static validate(world: WorldMap): string {
        const errors: string[] = []

        if (world.spawnCells.size === 0) {
            errors.push('Missing spawn zones!')
        }

        const spawnZoneErrors = this.validateSpawnZones(world)
        if (spawnZoneErrors) errors.push(spawnZoneErrors)

        if (!this.hasSurvivors(world)) {
            errors.push('Missing at least 1 survivor!')
        }

        return errors[0] || ''
    }

    private static validateSpawnZones(world: WorldMap): string | null {
        let hasAnyZone = false

        for (const [key, data] of world.spawnCells) {
            const coord = JSON.parse(key)

            if (data.type === SpawnZoneTypes.Group && data.groups.length === 0) {
                return `Group spawn zone at (${coord.x}, ${coord.y}) is missing a group ID!`
            }

            if (data.type === SpawnZoneTypes.Any) {
                hasAnyZone = true
            }
        }

        return !hasAnyZone ? "Missing at least 1 'Any' spawn zone!" : null
    }

    private static hasSurvivors(world: WorldMap): boolean {
        return world.stacks.some((stack) =>
            stack.contents.some((content) => content.type === 'sv' || content.type === 'svg')
        )
    }
}

class WorldSerializer {
    static toJSON(world: WorldMap): WorldFileData {
        return {
            settings: this.createSettings(world),
            spawn_locs: this.createSpawnLocations(world),
            cell_types: {
                fire_cells: world.fireCells,
                killer_cells: world.killerCells,
                charging_cells: world.chargingCells
            },
            stacks: world.stacks
        }
    }

    private static createSettings(world: WorldMap): WorldFileData['settings'] {
        return {
            world_info: {
                size: {
                    width: world.size.width,
                    height: world.size.height
                },
                seed: this.generateSeedIfNeeded(world.seed),
                world_file_levels: this.generateLevelsIfNeeded(world),
                agent_energy: world.initialAgentEnergy
            }
        }
    }

    private static createSpawnLocations(world: WorldMap): Spawn[] {
        return Array.from(world.spawnCells, ([spawn, data]) => {
            const { x, y } = JSON.parse(spawn)

            if (data.groups.length === 0) {
                return [{ x, y, type: data.type }]
            }

            return data.groups.map((gid) => ({
                x,
                y,
                gid,
                type: data.type
            }))
        }).flat()
    }

    private static generateSeedIfNeeded(seed: number): number {
        return seed !== 0 ? seed : Math.floor(Math.random() * 10000)
    }

    private static generateLevelsIfNeeded(
        world: WorldMap
    ): WorldFileData['settings']['world_info']['world_file_levels'] {
        return {
            high: world.high !== 0 ? world.high : 11 + Math.floor(Math.random() * 5),
            mid: world.mid !== 0 ? world.mid : 6 + Math.floor(Math.random() * 5),
            low: world.low !== 0 ? world.low : 1 + Math.floor(Math.random() * 5)
        }
    }
}

export async function importWorld(file: File): Promise<Simulation> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = (e) => {
            try {
                const content = e.target?.result as string
                const data = JSON.parse(content) as WorldFileData
                const world = WorldMap.fromData(data)
                resolve(new Simulation(world))
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

export async function exportWorld(worldMap: WorldMap, worldName: string): Promise<string | null> {
    const validationError = WorldValidator.validate(worldMap)
    if (validationError) return validationError

    try {
        const worldData = WorldSerializer.toJSON(worldMap)
        const stringWorld = JSON.stringify(worldData, null, 2)

        const aegisPath = localStorage.getItem('aegisPath')
        if (!aegisPath) throw new Error('Aegis path not found in localStorage')

        const fullName = `${worldName}.world`
        const fullPath = await aegisAPI.path.join(aegisPath, 'worlds', fullName)

        await aegisAPI.exportWorld(fullPath, stringWorld)
        return null
    } catch (error) {
        // @ts-ignore: error
        return `Error exporting world: ${error.message}`
    }
}
