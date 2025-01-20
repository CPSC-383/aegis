import { Location, Stack, Size, Spawn, SpawnZoneTypes, CellTypeMap } from '@/core/world'
import { whatBucket } from '@/utils/util'
import { shadesOfBrown, shadesOfBlue } from '@/types'
import { renderCoords } from '@/utils/renderUtils'

export class WorldMap {
    private readonly cellTypes: CellTypeMap

    /**
     * Constructs a new WorldMap instance.
     * @param width - The width of the map.
     * @param height - The height of the map.
     * @param seed - The seed used for procedural generation.
     * @param low - Low terrain level indicator.
     * @param mid - Mid terrain level indicator.
     * @param high - High terrain level indicator.
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
        public readonly low: number,
        public readonly mid: number,
        public readonly high: number,
        public readonly fireCells: Location[],
        public readonly killerCells: Location[],
        public readonly chargingCells: Location[],
        public readonly spawnCells: Map<string, { type: SpawnZoneTypes; groups: number[] }>,
        public readonly stacks: Stack[],
        public readonly initialAgentEnergy: number,
        public minMoveCost: number,
        public maxMoveCost: number
    ) {
        this.cellTypes = {
            fire: { color: '#ff9900', cells: fireCells },
            killer: { color: '#cc0000', cells: killerCells },
            charging: { color: '', cells: chargingCells } // Color determined dynamically
        }
    }

    /**
     * Creates a new WorldMap instance from serialized data.
     * @param data - Serialized data representing the world map.
     * @returns A WorldMap instance.
     */
    static fromData(data: any): WorldMap {
        const { world_info, agent_energy } = data.settings
        const { size, seed, world_file_levels } = world_info

        const spawnCells = new Map<string, { type: SpawnZoneTypes; groups: number[] }>(
            data.spawn_locs.map((spawn: Spawn) => {
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

        const stacks: Stack[] = data.stacks
        const moveCosts = stacks.map((stack) => stack.move_cost)

        return new WorldMap(
            size.width,
            size.height,
            seed,
            world_file_levels.low,
            world_file_levels.mid,
            world_file_levels.high,
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
     * Creates a new WorldMap instance with default parameters.
     * @param width - Width of the map.
     * @param height - Height of the map.
     * @param initialEnergy - Initial energy level for agents.
     * @returns A WorldMap instance with default parameters.
     */
    static fromParams(width: number, height: number, initialEnergy: number): WorldMap {
        const stacks: Stack[] = []

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                stacks.push({
                    cell_loc: { x, y },
                    move_cost: 1,
                    contents: []
                })
            }
        }

        return new WorldMap(width, height, 0, 0, 0, 0, [], [], [], new Map(), stacks, initialEnergy, 1, 1)
    }

    /**
     * Determines the type of a cell at the specified coordinates.
     * @param x - X-coordinate of the cell.
     * @param y - Y-coordinate of the cell.
     * @returns The type of the cell as a string.
     */
    getCellType(x: number, y: number): string {
        const matchLocation = (cell: Location) => cell.x === x && cell.y === y

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
            this.spawnCells.size === 0 &&
            this.stacks.every((stack) => stack.contents.length === 0 && stack.move_cost === 1)
        )
    }

    /**
     * Gets the size of the world map.
     * @returns An object containing the width and height of the map.
     */
    get size(): Size {
        return { width: this.width, height: this.height }
    }

    /**
     * Updates the minimum and maximum movement costs for cells in the map.
     */
    updateMinMaxMoveCosts(): void {
        const moveCosts = this.stacks.map((stack) => stack.move_cost)
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
        this.drawSpawnZones(ctx)
    }

    /**
     * Helper function to render terrain cells of the map.
     * @param ctx - Canvas rendering context.
     * @param thickness - Line thickness for drawing the cells.
     */
    private drawTerrain(ctx: CanvasRenderingContext2D, thickness: number): void {
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                const cell = this.stacks.find((cell) => cell.cell_loc.x === x && cell.cell_loc.y === y)
                if (!cell) continue

                const opacity = whatBucket(this.minMoveCost, this.maxMoveCost, cell.move_cost, shadesOfBrown.length)

                const [r, g, b] = shadesOfBrown[opacity]
                ctx.fillStyle = `rgb(${r}, ${g}, ${b})`

                const coords = renderCoords(x, y, this.size)
                ctx.fillRect(coords.x + thickness / 2, coords.y + thickness / 2, 1 - thickness, 1 - thickness)
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
            const cell = this.stacks.find((cell) => cell.cell_loc.x === loc.x && cell.cell_loc.y === loc.y)
            if (!cell) continue

            const opacity = whatBucket(this.minMoveCost, this.maxMoveCost, cell.move_cost, shadesOfBlue.length)

            const [r, g, b] = shadesOfBlue[opacity]
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`

            const coords = renderCoords(loc.x, loc.y, this.size)
            ctx.fillRect(coords.x + thickness / 2, coords.y + thickness / 2, 1 - thickness, 1 - thickness)
        }

        for (const [type, { color, cells }] of Object.entries(this.cellTypes)) {
            if (type === 'charging') continue

            ctx.fillStyle = color
            for (const loc of cells) {
                const coords = renderCoords(loc.x, loc.y, this.size)
                ctx.fillRect(coords.x + thickness / 2, coords.y + thickness / 2, 1 - thickness, 1 - thickness)
            }
        }
    }

    /**
     * Helper function to render spawn zones on the map.
     * @param ctx - Canvas rendering context.
     */
    private drawSpawnZones(ctx: CanvasRenderingContext2D): void {
        for (const [spawnPoint] of this.spawnCells) {
            const { x, y } = JSON.parse(spawnPoint)
            const coords = renderCoords(x, y, this.size)

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
}
