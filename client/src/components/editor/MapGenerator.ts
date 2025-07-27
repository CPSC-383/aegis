import Agents from '@/core/Agents'
import Game from '@/core/Game'
import Games from '@/core/Games'
import World from '@/core/World'
import { aegisAPI } from '@/services'
import { schema } from 'aegis-schema'

class WorldValidator {
  static validate(world: World): string {
    const errors: string[] = []

    if (world.getCellsByType(schema.CellType.SPAWN).length === 0) {
      errors.push('Missing spawn zones!')
    }

    if (!this.hasSurvivors(world)) {
      errors.push('Missing at least 1 survivor!')
    }

    return errors[0] || ''
  }

  private static hasSurvivors(world: World): boolean {
    // FIX: Update to new world layout
    return false

    // return world.stacks.some((stack: Layers) =>
    //   stack.contents.some((content: CellContent) => content.type === 'sv')
    // )
  }
}

export async function importWorld(file: File): Promise<Games> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.readAsArrayBuffer(file)
    reader.onload = (): void => {
      const binary = new Uint8Array(reader.result as ArrayBuffer)
      const proto_world = schema.World.fromBinary(binary)
      const world = World.fromSchema(proto_world)
      const games = new Games()
      const agents = new Agents(games)
      const game = new Game(games, world, agents)
      games.currentGame = game
      resolve(games)
    }
  })
}

export async function exportWorld(
  world: World,
  worldName: string
): Promise<string | null> {
  const validationError = WorldValidator.validate(world)
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
