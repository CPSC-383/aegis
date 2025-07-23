import { shadesOfBlue, shadesOfBrown, Size } from '@/types'
import { renderCoords } from '@/utils/renderUtils'
import { getImage, whatBucket } from '@/utils/util'
import survivorSrc from '@/assets/survivor.png'
import { schema } from 'aegis-schema'
import Game from './Game'
import { error } from 'console'

// Interface for world data structure
interface WorldData {
  settings: {
    world_info: {
      size: { width: number; height: number }
      seed: number
      agent_energy: number
    }
  }
  spawn_locs: Array<{
    x: number
    y: number
    type: string
    gid?: number
  }>
  stacks: schema.Cell[]
  cell_types: {
    fire_cells: Location[]
    killer_cells: Location[]
    charging_cells: Location[]
  }
}

export default class World {
  private readonly cellTypes: CellTypeMap

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
  ) {
    this.cellTypes = {
      fire: { color: '#ff9900', cells: fireCells },
      killer: { color: '#cc0000', cells: killerCells },
      charging: { color: '', cells: chargingCells } // Color determined dynamically
    }
  }

  public applyRound(round: schema.Round | null): void { }

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
  static fromData(data: WorldData): World {
    const { world_info } = data.settings
    const { size, seed, agent_energy } = world_info

    const spawnCells = new Map<string, SpawnZoneData>(
      data.spawn_locs.map((spawn) => {
        const key = JSON.stringify({ x: spawn.x, y: spawn.y })
        return [
          key,
          {
            type: spawn.type as SpawnZoneTypes,
            groups: spawn.gid ? [spawn.gid] : []
          }
        ]
      })
    )

    const cells: schema.Cell[] = data.stacks
    const moveCosts = cells.map((cell) => cell.moveCost)

    return new World(
      size.width,
      size.height,
      seed,
      data.cell_types.fire_cells,
      data.cell_types.killer_cells,
      data.cell_types.charging_cells,
      spawnCells,
      stacks,
      agent_energy,
      Math.min(...moveCosts),
      Math.max(...moveCosts)
    )
  }

  /**
   * Creates a new World instance with default parameters.
   * @param width - Width of the map.
   * @param height - Height of the map.
   * @param initialEnergy - Initial energy level for agents.
   * @returns A World instance with default parameters.
   */
  static fromParams(width: number, height: number, initialEnergy: number): World {
    const cells: Cell[] = []

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const cell = Cell.create({
          loc: { x, y },
          moveCost: 1,
          type: CellType.NORMAL,
          agents: [],
          layers: []
        })
        cells.push(cell)
      }
    }

    return new World(width, height, 0, [], [], [], [], cells, initialEnergy, 1, 1)
  }

  public copy(): World {
    return new World(
      this.width,
      this.height,
      this.seed,
      [...this.fireCells.map((loc) => ({ ...loc }))],
      [...this.killerCells.map((loc) => ({ ...loc }))],
      [...this.chargingCells.map((loc) => ({ ...loc }))],
      [...this.spawnCells.map((loc) => ({ ...loc }))],
      this.cells.map((cell) => ({ ...cell, loc: { ...cell.loc! } })),
      this.startEnergy,
      this.minMoveCost,
      this.maxMoveCost
    )
  }

  /**
   * Determines the type of a cell at the specified coordinates.
   * @param x - X-coordinate of the cell.
   * @param y - Y-coordinate of the cell.
   * @returns The type of the cell as a string.
   */
  getCellType(x: number, y: number): string {
    const matchLocation = (cell: Location): boolean => cell.x === x && cell.y === y

    if (this.fireCells.some(matchLocation)) return 'CellType.FIRE_CELL'
    if (this.killerCells.some(matchLocation)) return 'CellType.KILLER_CELL'
    if (this.chargingCells.some(matchLocation)) return 'CellType.CHARGING_CELL'
    return 'CellType.NORMAL_CELL'
  }

  /**
   * Checks if the world map is empty.
   * @returns True if the map is empty, otherwise false.
   */
  isEmpty(): boolean {
    return (
      Object.values(this.cellTypes).every((type) => type.cells.length === 0) &&
      this.spawnCells.length === 0 &&
      this.cells.every((cell) => cell.layers.length === 0 && cell.moveCost === 1)
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
    // this.drawSpecialCells(ctx, thickness)
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
   * Helper function to render special cells like charging cells, fire cells, and killer cells.
   * @param ctx - Canvas rendering context.
   * @param thickness - Line thickness for drawing the cells.
   */
  private drawSpecialCells(ctx: CanvasRenderingContext2D, thickness: number): void {
    for (const loc of this.chargingCells) {
      const cell = this.cells.find(
        (cell) => cell.loc!.x === loc.x && cell.loc!.y === loc.y
      )
      if (!cell) continue

      const opacity = whatBucket(
        this.minMoveCost,
        this.maxMoveCost,
        cell.moveCost,
        shadesOfBlue.length
      )

      const [r, g, b] = shadesOfBlue[opacity]
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`

      const coords = renderCoords(loc.x, loc.y, this.size)
      ctx.fillRect(
        coords.x + thickness / 2,
        coords.y + thickness / 2,
        1 - thickness,
        1 - thickness
      )
    }

    for (const [type, { color, cells }] of Object.entries(this.cellTypes)) {
      if (type === 'charging') continue

      ctx.fillStyle = color
      for (const loc of cells) {
        const coords = renderCoords(loc.x, loc.y, this.size)
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
      ctx.restore()
    }
  }

  public drawLayers(ctx: CanvasRenderingContext2D): void {
    const surv = getImage(survivorSrc)
    if (!surv) throw new Error("surv should be loaded already")

    const { width, height } = this.size

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const coords = renderCoords(x, y, this.size)
        ctx.clearRect(coords.x, coords.y, 1, 1)

        const layers = this.cellAt(x, y).layers
        if (!layers.length) continue

        const layer = layers[layers.length - 1]
        const survivors = this.countByKind(layers, "survivor")


        if (layer.object.oneofKind === "survivor") {
          ctx.drawImage(surv, coords.x, coords.y, 1, 1)
        } else if (layer.object.oneofKind === "rubble") {
        }
      }
    }
    //       // if (layer.object.oneofKind == "rubble") {
    //       //   const minMoveCost = game.world.minMoveCost
    //       //   const maxMoveCost = game.world.maxMoveCost
    //       //   const moveCost = game.getCell(x, y).moveCost
    //       //   // whichShade should be between 0 and shadesOfBrown.length i hope
    //       //   const whichShade = whatBucket(
    //       //     minMoveCost,
    //       //     maxMoveCost,
    //       //     moveCost,
    //       //     shadesOfBrown.length
    //       //   )
    //       //   rowInSheet = 1
    //       //   colInSheet = whichShade
    //       // } else if (layer.object.oneofKind == "survivor") {
    //       //   rowInSheet = 4
    //       //   colInSheet = 0
    //       // }
    //
    //       ctx.drawImage(
    //         layerSpriteSheet,
    //         colInSheet * spriteHeight,
    //         rowInSheet * spriteWidth,
    //         spriteWidth,
    //         spriteHeight,
    //         coords.x + thickness / 2,
    //         coords.y + thickness / 2,
    //         1 - thickness,
    //         1 - thickness
    //       )
    //
    //       // draw survivor sprites on edge of cell if there are any in the layer
    //       // const numOfSurvivorsInCellLayers = Math.min(
    //       //   layers.filter((layer) => layer.object.oneofKind === 'survivor').length,
    //       //   5
    //       // )
    //
    //       // draw survivor sprite onto cell
    //       // const survivorColumn = numOfSurvivorsInCellLayers - 1
    //       // const survivorRow = 2 // light blue squares are row 3 on spritesheet
    //       // ctx.drawImage(
    //       //   layerSpriteSheet,
    //       //   survivorColumn * spriteWidth,
    //       //   survivorRow * spriteHeight,
    //       //   spriteWidth,
    //       //   spriteHeight,
    //       //   coords.x + thickness / 2,
    //       //   coords.y + thickness / 2,
    //       //   1 - thickness,
    //       //   1 - thickness
    //       // )
    //     }
    //   }
    // }

  }

  private countByKind(layers: schema.WorldObject[], kind: string) {
    return layers.filter(layer => layer.object.oneofKind === kind).length
  }
}

