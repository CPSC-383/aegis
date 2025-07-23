import { shadesOfBlue, shadesOfBrown, Size } from '@/types'
import { renderCoords } from '@/utils/renderUtils'
import { getImage, whatBucket } from '@/utils/util'
import survivorSrc from '@/assets/survivor.png'
import { schema } from 'aegis-schema'
import Game from './Game'

// Interface for world data structure

export default class World {
  /**
   * Constructs a new World instance.
   * @param width - The width of the map.
   * @param height - The height of the map.
   * @param seed - The seed used for procedural generation.
   * @param fireCells - Array of locations representing fire cells.
   * @param killerCells - Array of locations representing killer cells.
   * @param chargingCells - Array of locations representing charging cells.
   * @param spawnCells - Map of spawn zones with their types and associated groups.
   * @param stacks - Array of stacks containing cell data and movement costs.
   * @param initialAgentEnergy - Initial energy level for agents in the map.
   * @param minMoveCost - Minimum movement cost for cells in the map.
   * @param maxMoveCost - Maximum movement cost for cells in the map.
   */
  constructor(
    public readonly width: number,
    public readonly height: number,
    public readonly seed: number,
    public readonly fireCells: schema.Location[],
    public readonly killerCells: schema.Location[],
    public readonly chargingCells: schema.Location[],
    public readonly spawnCells: schema.Location[],
    public readonly cells: schema.Cell[],
    public readonly startEnergy: number,
    public minMoveCost: number,
    public maxMoveCost: number
  ) { }

  public applyRound(round: schema.Round | null): void {
    if (!round) return

    for (const loc of round.layersRemoved) {
      const cell = this.cellAt(loc.x, loc.y);
      cell.layers.pop()
    }
  }

  /**
   * Creates a new World instance from protobuf WorldState data.
   * @param worldState - Protobuf WorldState data.
   * @returns A World instance.
   */
  public static fromSchema(world: schema.World): World {
    const chargingCells: schema.Location[] = []
    const killerCells: schema.Location[] = []
    const spawnCells: schema.Location[] = []

    for (const cell of world.cells) {
      const { loc, type } = cell

      switch (type) {
        case schema.CellType.CHARGING:
          chargingCells.push(loc!)
          break
        case schema.CellType.KILLER:
          killerCells.push(loc!)
          break
        case schema.CellType.SPAWN:
          spawnCells.push(loc!)
          break
        default:
          break
      }
    }

    const moveCosts = world.cells.map((cell) => cell.moveCost)

    return new World(
      world.width,
      world.height,
      world.seed,
      [], // fireCells
      killerCells,
      chargingCells,
      spawnCells,
      world.cells,
      world.startEnergy,
      Math.min(...moveCosts),
      Math.max(...moveCosts)
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
  // static fromParams(width: number, height: number, initialEnergy: number): World {
  //   const cells: Cell[] = []
  //
  //   for (let x = 0; x < width; x++) {
  //     for (let y = 0; y < height; y++) {
  //       const cell = Cell.create({
  //         loc: { x, y },
  //         moveCost: 1,
  //         type: CellType.NORMAL,
  //         agents: [],
  //         layers: []
  //       })
  //       cells.push(cell)
  //     }
  //   }
  //
  //   return new World(width, height, 0, [], [], [], [], cells, initialEnergy, 1, 1)
  // }

  public copy(): World {
    return new World(
      this.width,
      this.height,
      this.seed,
      [...this.fireCells.map((loc) => ({ ...loc }))],
      [...this.killerCells.map((loc) => ({ ...loc }))],
      [...this.chargingCells.map((loc) => ({ ...loc }))],
      [...this.spawnCells.map((loc) => ({ ...loc }))],
      this.cells.map(this.copyCell),
      this.startEnergy,
      this.minMoveCost,
      this.maxMoveCost
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
      layers: cell.layers.map(layer => ({ ...layer })),
    }
  }

  /**
   * Checks if the world map is empty.
   * A world is considered empty if:
   * - There are no spawn cells,
   * - All cells have no layers,
   * - All cells are of type "normal".
   * @returns True if the map is empty, otherwise false.
   */
  isEmpty(): boolean {
    return (
      this.spawnCells.length === 0 &&
      this.cells.every(
        (cell) => cell.layers.length === 0 && cell.type === schema.CellType.NORMAL
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

  public cellAt(x: number, y: number) {
    return this.cells[y + x * this.width]
  }

  /**
   * Updates the minimum and maximum movement costs for cells in the map.
   */
  updateMinMaxMoveCosts(): void {
    const moveCosts = this.cells.map((cell) => cell.moveCost)
    this.minMoveCost = Math.min(...moveCosts)
    this.maxMoveCost = Math.max(...moveCosts)
  }

  /**
   * Renders the map onto a canvas context.
   * @param ctx - Canvas rendering context.
   */
  draw(ctx: CanvasRenderingContext2D): void {
    const thickness = 0.04
    ctx.strokeStyle = 'black'
    ctx.lineWidth = thickness

    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, this.width, this.height)

    this.drawCells(ctx, thickness)
  }

  /**
   * Helper function to render all cells of the map.
   * @param ctx - Canvas rendering context.
   * @param thickness - Line thickness for drawing the cells.
   */
  private drawCells(ctx: CanvasRenderingContext2D, thickness: number): void {
    this.drawTerrain(ctx, thickness)
    this.drawSpecialCells(ctx, thickness)
    this.drawSpawns(ctx)
  }

  /**
   * Helper function to render terrain cells of the map.
   * @param ctx - Canvas rendering context.
   * @param thickness - Line thickness for drawing the cells.
   */
  private drawTerrain(ctx: CanvasRenderingContext2D, thickness: number): void {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const cell = this.cells.find((cell) => cell.loc!.x === x && cell.loc!.y === y)
        if (!cell) continue

        const opacity = whatBucket(
          this.minMoveCost,
          this.maxMoveCost,
          cell.moveCost,
          shadesOfBrown.length
        )

        const [r, g, b] = shadesOfBrown[opacity]
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`

        const coords = renderCoords(x, y, this.size)
        ctx.fillRect(
          coords.x + thickness / 2,
          coords.y + thickness / 2,
          1 - thickness,
          1 - thickness
        )
      }
    }
  }

  /**
   * Helper function to render special cells like charging, fire, and killer cells.
   * @param ctx - Canvas rendering context.
   * @param thickness - Line thickness for drawing the cells.
   */
  private drawSpecialCells(ctx: CanvasRenderingContext2D, thickness: number): void {
    // Charging cells - dynamic blue shade based on moveCost
    for (const loc of this.chargingCells) {
      const cell = this.cells.find((c) => c.loc!.x === loc.x && c.loc!.y === loc.y)
      if (!cell) continue

      const bucket = whatBucket(
        this.minMoveCost,
        this.maxMoveCost,
        cell.moveCost,
        shadesOfBlue.length
      )
      const [r, g, b] = shadesOfBlue[bucket]
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`

      const coords = renderCoords(loc.x, loc.y, this.size)
      ctx.fillRect(
        coords.x + thickness / 2,
        coords.y + thickness / 2,
        1 - thickness,
        1 - thickness
      )
    }

    // ctx.fillStyle = '#ff9900'
    // for (const loc of this.fireCells) {
    //   const coords = renderCoords(loc.x, loc.y, this.size)
    //   ctx.fillRect(
    //     coords.x + thickness / 2,
    //     coords.y + thickness / 2,
    //     1 - thickness,
    //     1 - thickness
    //   )
    // }

    ctx.fillStyle = '#cc0000'
    for (const loc of this.killerCells) {
      const coords = renderCoords(loc.x, loc.y, this.size)
      ctx.fillRect(
        coords.x + thickness / 2,
        coords.y + thickness / 2,
        1 - thickness,
        1 - thickness
      )
    }
  }

  /**
   * Helper function to render spawn zones on the map.
   * @param ctx - Canvas rendering context.
   */
  private drawSpawns(ctx: CanvasRenderingContext2D): void {
    for (const spawn of this.spawnCells) {
      const coords = renderCoords(spawn.x, spawn.y, this.size)

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
    }
  }

  public drawLayers(game: Game, ctx: CanvasRenderingContext2D, full: boolean): void {
    const surv = getImage(survivorSrc)
    if (!surv) throw new Error("surv should be loaded already")

    const locs = full
      ? this.getAllLocations()
      : game.currentRound.layersRemoved

    for (const loc of locs) {
      const x = loc.x
      const y = loc.y

      const coords = renderCoords(x, y, this.size)
      ctx.clearRect(coords.x, coords.y, 1, 1)

      const layers = this.cellAt(x, y).layers
      if (!layers.length) continue

      const survivorCount = this.countByKind(layers, "survivor")
      const rubbleCount = this.countByKind(layers, "rubble")

      const topLayer = layers[layers.length - 1]
      const kind = topLayer.object.oneofKind

      if (kind === "survivor") {
        ctx.drawImage(surv, coords.x, coords.y, 1, 1)
      } else if (kind === "rubble") {
        ctx.fillStyle = "#555555"
        ctx.fillRect(coords.x + 0.2, coords.y + 0.2, 0.6, 0.6)
      }

      ctx.font = "0.2px Arial"
      ctx.textBaseline = "bottom"

      if (survivorCount > 1) {
        ctx.fillStyle = "blue"
        ctx.textAlign = "right"
        ctx.fillText(String(survivorCount), coords.x + 0.95, coords.y + 0.95)
      }

      if (rubbleCount > 1) {
        ctx.fillStyle = "#555555"
        ctx.textAlign = "left"
        ctx.fillText(String(rubbleCount), coords.x + 0.05, coords.y + 0.95)
      }
    }
  }

  private countByKind(layers: schema.WorldObject[], kind: string) {
    return layers.filter(layer => layer.object.oneofKind === kind).length
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

