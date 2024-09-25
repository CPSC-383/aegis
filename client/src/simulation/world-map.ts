import { Location, Stack, Size, Spawn } from '@/utils/types'
import { whatBucket } from '@/utils/util'
import { shadesOfBrown, shadesOfBlue } from '@/utils/types'
import { renderCoords } from '@/utils/renderUtils'

export class WorldMap {
    constructor(
        public readonly width: number,
        public readonly height: number,
        public readonly fireGrids: Location[],
        public readonly killerGrids: Location[],
        public readonly chargingGrids: Location[],
        public readonly spawnGrids: Map<string, number[]>,
        public readonly stacks: Stack[],
        public readonly initialAgentEnergy: number,
        public readonly minMoveCost: number,
        public readonly maxMoveCost: number
    ) {}

    static fromData(data: any) {
        const width: number = data.settings.world_info.size.width
        const height: number = data.settings.world_info.size.height
        const fireGrids: Location[] = data.grid_types.fire_grids
        const killerGrids: Location[] = data.grid_types.killer_grids
        const chargingGrids: Location[] = data.grid_types.charging_grids

        const spawnGrids: Map<string, number[]> = new Map()
        data.spawn_locs.forEach((spawn: Spawn) => {
            const key = JSON.stringify({ x: spawn.x, y: spawn.y })
            if (!spawnGrids.has(key)) spawnGrids.set(key, [])
            if (spawn.gid) spawnGrids.get(key)?.push(spawn.gid)
        })

        const stacks: Stack[] = data.stacks
        const initialAgentEnergy: number = data.settings.world_info.agent_energy
        const minMoveCost: number = Math.min(...stacks.map((stack) => stack.move_cost))
        const maxMoveCost: number = Math.max(...stacks.map((stack) => stack.move_cost))

        return new WorldMap(
            width,
            height,
            fireGrids,
            killerGrids,
            chargingGrids,
            spawnGrids,
            stacks,
            initialAgentEnergy,
            minMoveCost,
            maxMoveCost
        )
    }

    static fromParams(width: number, height: number, initialEnergy: number) {
        const stacks: Stack[] = []

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                stacks.push({
                    grid_loc: { x, y },
                    move_cost: 1,
                    contents: []
                })
            }
        }
        const minMoveCost = Math.min(...stacks.map((stack) => stack.move_cost))
        const maxMoveCost = Math.max(...stacks.map((stack) => stack.move_cost))

        return new WorldMap(width, height, [], [], [], new Map(), stacks, initialEnergy, minMoveCost, maxMoveCost)
    }

    getGridType(x: number, y: number): string {
        if (this.fireGrids.some((grid) => grid.x === x && grid.y === y)) {
            return 'GridType.FIRE_GRID'
        }

        if (this.killerGrids.some((grid) => grid.x === x && grid.y === y)) {
            return 'GridType.KILLER_GRID'
        }

        if (this.chargingGrids.some((grid) => grid.x === x && grid.y === y)) {
            return 'GridType.CHARGING_GRID'
        }

        return 'GridType.NORMAL_GRID'
    }

    isEmpty(): boolean {
        const areStacksEmpty = this.stacks.every((s) => s.contents.length === 0)
        const areMoveCostsDefault = this.stacks.every((s) => s.move_cost === 1)

        return (
            this.fireGrids.length === 0 &&
            this.killerGrids.length === 0 &&
            this.chargingGrids.length === 0 &&
            this.spawnGrids.size === 0 &&
            areStacksEmpty &&
            areMoveCostsDefault
        )
    }

    get size(): Size {
        return { width: this.width, height: this.height }
    }

    draw(ctx: CanvasRenderingContext2D) {
        const thickness = 0.04
        ctx.strokeStyle = 'black'
        ctx.lineWidth = thickness

        // fill entire canvas with dark grey
        ctx.fillStyle = '#000000'
        ctx.fillRect(0, 0, this.width, this.height)

        this.drawGridCells(ctx, thickness)
    }

    private drawGridCells(ctx: CanvasRenderingContext2D, thickness: number) {
        const moveCosts = this.stacks.map((grid) => grid.move_cost)
        const maxMoveCost = Math.max(...moveCosts)
        const minMoveCost = Math.min(...moveCosts)

        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                const grid = this.stacks.find((grid) => grid.grid_loc.x === x && grid.grid_loc.y === y)
                if (!grid) continue

                const whichOpacity = whatBucket(minMoveCost, maxMoveCost, grid.move_cost, shadesOfBrown.length)
                const gridFillStyle = `rgb(${shadesOfBrown[whichOpacity][0]}, ${shadesOfBrown[whichOpacity][1]}, ${shadesOfBrown[whichOpacity][2]})`

                const coords = renderCoords(x, y, this.size)
                ctx.fillStyle = gridFillStyle
                ctx.fillRect(coords.x + thickness / 2, coords.y + thickness / 2, 1 - thickness, 1 - thickness)
            }
        }

        for (const loc of this.chargingGrids) {
            const grid = this.stacks.find((grid) => grid.grid_loc.x === loc.x && grid.grid_loc.y === loc.y)
            if (!grid) continue

            const whichOpacity = whatBucket(minMoveCost, maxMoveCost, grid.move_cost, shadesOfBlue.length)
            const gridFillStyle = `rgb(${shadesOfBlue[whichOpacity][0]}, ${shadesOfBlue[whichOpacity][1]}, ${shadesOfBlue[whichOpacity][2]})`

            const coords = renderCoords(loc.x, loc.y, this.size)
            ctx.fillStyle = gridFillStyle
            ctx.fillRect(coords.x + thickness / 2, coords.y + thickness / 2, 1 - thickness, 1 - thickness)
        }

        for (const loc of this.fireGrids) {
            const coords = renderCoords(loc.x, loc.y, this.size)
            ctx.fillStyle = '#ff9900'
            ctx.fillRect(coords.x + thickness / 2, coords.y + thickness / 2, 1 - thickness, 1 - thickness)
        }

        for (const loc of this.killerGrids) {
            const coords = renderCoords(loc.x, loc.y, this.size)
            ctx.fillStyle = '#cc0000'
            ctx.fillRect(coords.x + thickness / 2, coords.y + thickness / 2, 1 - thickness, 1 - thickness)
        }

        // This will only draw in the world editor
        for (const [spawn, _] of this.spawnGrids) {
            const { x, y } = JSON.parse(spawn)
            const coords = renderCoords(x, y, this.size)
            const x1 = coords.x
            const y1 = coords.y
            const x2 = coords.x + 1 - thickness
            const y2 = coords.y + 1 - thickness

            ctx.beginPath()
            ctx.strokeStyle = '#000000'
            ctx.moveTo(x1, y1)
            ctx.lineTo(x2, y2)
            ctx.stroke()

            ctx.beginPath()
            ctx.moveTo(x1, y2)
            ctx.lineTo(x2, y1)
            ctx.stroke()
        }
    }
}
