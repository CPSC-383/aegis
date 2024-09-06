import { aegisAPI } from '@/aegis-api'
import { WorldMap } from '@/simulation/world-map'

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
    if (world.spawnGrids.size === 0) return 'Missing spawn zones!'

    const hasSurvivors = world.stacks.some((stack) =>
        stack.contents.some((content) => content.type === 'sv' || content.type === 'svg')
    )

    if (!hasSurvivors) return 'Missing at least 1 survivor!'

    return ''
}

const createWorld = (world: WorldMap) => {
    const spawn_locs = Array.from(world.spawnGrids, ([spawn, gids]) => {
        const { x, y } = JSON.parse(spawn)
        if (gids.length === 0) return { x, y }
        else return gids.map((gid) => ({ x, y, gid }))
    }).flat()

    return {
        settings: {
            world_info: {
                size: {
                    width: world.size.width,
                    height: world.size.height
                },
                seed: Math.floor(Math.random() * 10000),
                world_file_levels: {
                    high: 11 + Math.floor(Math.random() * 5),
                    mid: 6 + Math.floor(Math.random() * 5),
                    low: 1 + Math.floor(Math.random() * 5)
                },
                agent_energy: world.initialAgentEnergy
            }
        },
        spawn_locs,
        grid_types: {
            fire_grids: world.fireGrids,
            killer_grids: world.killerGrids,
            charging_grids: world.chargingGrids
        },
        stacks: world.stacks
    }
}
