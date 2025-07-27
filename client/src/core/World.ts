import survivorSrc from '@/assets/survivor.png'
import { getMoveCostColor, Size, Vector } from '@/types'
import { THICKNESS } from '@/utils/constants'
import { renderCoords } from '@/utils/renderUtils'
import { getImage } from '@/utils/util'
import { schema } from 'aegis-schema'
import { EditorBrush, LayersBrush, MoveCostBrush, ZoneBrush } from './Brushes'
import Game from './Game'
import Round from './Round'

/**
 * Represents a world in the AEGIS game.
 * @param width - Width of the world in cells.
 * @param height - Height of the world in cells.
 * @param seed - Random seed for world generation.
 * @param cells - Array of cells in the world.
 * @param startEnergy - Starting energy for agents.
 */
export default class World {
  constructor(
    public readonly width: number,
    public readonly height: number,
    public readonly seed: number,
    public readonly cells: schema.Cell[],
    public readonly startEnergy: number
  ) {}

  public applyRound(round: schema.Round | null): void {
    if (!round) return

    for (const loc of round.layersRemoved) {
      const cell = this.cellAt(loc.x, loc.y)!
      cell.layers.pop()
    }
  }

  /**
   * Creates a new World instance from protobuf WorldState data.
   * @param worldState - Protobuf WorldState data.
   * @returns A World instance.
   */
  public static fromSchema(world: schema.World): World {
    return new World(
      world.width,
      world.height,
      world.seed,
      world.cells,
      world.startEnergy
    )
  }

  /**
   * Creates a new World instance from serialized data.
   * @param data - Serialized data representing the world map.
   * @returns A World instance.
   */
  // static fromData(data: WorldData): World {
  //   const { world_info } = data.settings
  //   const { size, seed, agent_energy } = world_info
  //
  //   const spawnCells = new Map<string, SpawnZoneData>(
  //     data.spawn_locs.map((spawn) => {
  //       const key = JSON.stringify({ x: spawn.x, y: spawn.y })
  //       return [
  //         key,
  //         {
  //           type: spawn.type as SpawnZoneTypes,
  //           groups: spawn.gid ? [spawn.gid] : []
  //         }
  //       ]
  //     })
  //   )
  //
  //   const cells: schema.Cell[] = data.stacks
  //   const moveCosts = cells.map((cell) => cell.moveCost)
  //
  //   return new World(
  //     size.width,
  //     size.height,
  //     seed,
  //     data.cell_types.fire_cells,
  //     data.cell_types.killer_cells,
  //     data.cell_types.charging_cells,
  //     spawnCells,
  //     stacks,
  //     agent_energy,
  //     Math.min(...moveCosts),
  //     Math.max(...moveCosts)
  //   )
  // }

  /**
   * Creates a new World instance with default parameters.
   * @param width - Width of the map.
   * @param height - Height of the map.
   * @param initialEnergy - Initial energy level for agents.
   * @returns A World instance with default parameters.
   */
  static fromParams(width: number, height: number, initialEnergy: number): World {
    const cells: schema.Cell[] = Array.from({ length: width * height }, (_, index) => {
      const x = index % width
      const y = Math.floor(index / width)

      return schema.Cell.create({
        loc: { x, y },
        moveCost: 1,
        type: schema.CellType.NORMAL,
        agents: [],
        layers: []
      })
    })

    return new World(width, height, 0, cells, initialEnergy)
  }

  public copy(): World {
    return new World(
      this.width,
      this.height,
      this.seed,
      this.cells.map(this.copyCell),
      this.startEnergy
    )
  }

  /**
   * Creates a deep copy of a Cell object.
   *
   * @param {schema.Cell} cell - The cell to copy.
   * @returns {schema.Cell} A deep copy of the input cell.
   */
  private copyCell(cell: schema.Cell): schema.Cell {
    return {
      loc: cell.loc ? { ...cell.loc } : undefined,
      moveCost: cell.moveCost,
      type: cell.type,
      agents: [...cell.agents],
      layers: cell.layers.map((layer) => ({ ...layer }))
    }
  }

  /**
   * Checks if the world map is empty.
   * A world is considered empty if:
   * - There are no spawn cells,
   * - All cells have no layers,
   * - All cells are of type "normal".
   * - All cells have a move cost of 1.
   * @returns True if the map is empty, otherwise false.
   */
  isEmpty(): boolean {
    return (
      this.getCellsByType(schema.CellType.SPAWN).length === 0 &&
      this.cells.every(
        (cell) =>
          cell.layers.length === 0 &&
          cell.type === schema.CellType.NORMAL &&
          cell.moveCost === 1
      )
    )
  }

  /**
   * Gets the size of the world map.
   * @returns An object containing the width and height of the map.
   */
  get size(): Size {
    return { width: this.width, height: this.height }
  }

  public cellAt(x: number, y: number): schema.Cell | undefined {
    return this.cells[x + y * this.width]
  }

  /**
   * Renders the map onto a canvas context.
   * @param ctx - Canvas rendering context.
   */
  draw(ctx: CanvasRenderingContext2D): void {
    ctx.strokeStyle = 'black'
    ctx.lineWidth = THICKNESS

    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, this.width, this.height)

    this.drawCells(ctx)
  }

  /**
   * Helper function to render all cells of the map.
   * @param ctx - Canvas rendering context.
   * @param thickness - Line thickness for drawing the cells.
   */
  private drawCells(ctx: CanvasRenderingContext2D): void {
    this.drawTerrain(ctx)
    this.drawSpecialCells(ctx)
  }

  /**
   * Helper function to render terrain cells of the map.
   * @param ctx - Canvas rendering context.
   * @param thickness - Line thickness for drawing the cells.
   */
  private drawTerrain(ctx: CanvasRenderingContext2D): void {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const cell = this.cellAt(x, y)
        if (!cell) continue

        const [r, g, b] = getMoveCostColor(cell.moveCost, 'brown')
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`

        const coords = renderCoords(x, y, this.size)
        ctx.fillRect(
          coords.x + THICKNESS / 2,
          coords.y + THICKNESS / 2,
          1 - THICKNESS,
          1 - THICKNESS
        )
      }
    }
  }

  /**
   * Helper function to render special cells like charging, fire, and killer cells.
   * @param ctx - Canvas rendering context.
   */
  private drawSpecialCells(ctx: CanvasRenderingContext2D): void {
    for (const cell of this.cells) {
      if (!cell.loc) continue
      const { x, y } = cell.loc

      const coords = renderCoords(x, y, this.size)

      if (cell.type === schema.CellType.NORMAL) continue

      if (cell.type === schema.CellType.CHARGING) {
        const [r, g, b] = getMoveCostColor(cell.moveCost, 'blue')
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`
      } else if (cell.type === schema.CellType.KILLER) {
        ctx.fillStyle = '#cc0000'
      } else if (cell.type === schema.CellType.SPAWN) {
        this.drawSpawn(ctx, coords)
        continue
      }

      ctx.fillRect(
        coords.x + THICKNESS / 2,
        coords.y + THICKNESS / 2,
        1 - THICKNESS,
        1 - THICKNESS
      )
    }
  }

  /**
   * Helper function to render spawn zones on the map.
   * @param ctx - Canvas rendering context.
   */
  private drawSpawn(ctx: CanvasRenderingContext2D, coords: Vector): void {
    ctx.save()

    ctx.beginPath()
    ctx.rect(coords.x, coords.y, 1, 1)
    ctx.clip()

    const stripeWidth = 0.125
    const numStripes = 8

    for (let i = -numStripes; i < numStripes * 2; i++) {
      ctx.beginPath()
      ctx.fillStyle = i % 2 === 0 ? '#ffff00' : '#000000'

      const startPointX = coords.x + i * stripeWidth
      const endPointX = startPointX + stripeWidth

      ctx.beginPath()
      ctx.moveTo(startPointX, coords.y)
      ctx.lineTo(endPointX, coords.y)
      ctx.lineTo(endPointX - 1, coords.y + 1)
      ctx.lineTo(startPointX - 1, coords.y + 1)
      ctx.closePath()
      ctx.fill()
    }
    ctx.restore()
  }

  public drawLayers(game: Game, ctx: CanvasRenderingContext2D, full: boolean): void {
    const surv = getImage(survivorSrc)
    if (!surv) throw new Error('surv should be loaded already')

    const locs = full ? this.getAllLocations() : game.currentRound.layersRemoved

    for (const loc of locs) {
      const x = loc.x
      const y = loc.y

      const coords = renderCoords(x, y, this.size)
      ctx.clearRect(coords.x, coords.y, 1, 1)

      const layers = this.cellAt(x, y)!.layers
      if (!layers.length) continue

      const survivorCount = this.countByKind(layers, 'survivor')
      const rubbleCount = this.countByKind(layers, 'rubble')

      const topLayer = layers[layers.length - 1]
      const kind = topLayer.object.oneofKind

      if (kind === 'survivor') {
        ctx.drawImage(surv, coords.x, coords.y, 1, 1)
      } else if (kind === 'rubble') {
        ctx.fillStyle = '#555555'
        ctx.fillRect(coords.x + 0.2, coords.y + 0.2, 0.6, 0.6)
      }

      ctx.font = '0.2px Arial'
      ctx.textBaseline = 'bottom'

      if (survivorCount > 0) {
        ctx.fillStyle = 'blue'
        ctx.textAlign = 'right'
        ctx.fillText(String(survivorCount), coords.x + 0.95, coords.y + 0.95)
      }

      if (rubbleCount > 0) {
        ctx.fillStyle = '#555555'
        ctx.textAlign = 'left'
        ctx.fillText(String(rubbleCount), coords.x + 0.05, coords.y + 0.95)
      }
    }
  }

  public getBrushes(round: Round): EditorBrush[] {
    return [new ZoneBrush(round), new MoveCostBrush(round), new LayersBrush(round)]
  }

  public getCellsByType(type: schema.CellType): schema.Cell[] {
    return this.cells.filter((cell) => cell.type === type)
  }

  private countByKind(layers: schema.WorldObject[], kind: string): number {
    return layers.filter((layer) => layer.object.oneofKind === kind).length
  }

  private getAllLocations(): schema.Location[] {
    const locs: schema.Location[] = []
    const { width, height } = this.size
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        locs.push({ x, y })
      }
    }
    return locs
  }
}
