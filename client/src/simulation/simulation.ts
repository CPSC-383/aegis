import { EventType, dispatchEvent } from '@/events'
import { WorldMap } from './world-map'
import { World, RoundData, AgentInfoDict, GridCellDict, StackContent } from '@/utils/types'

export class Simulation {
    private rounds: World[] = []
    public maxRounds: number = -1 // Start this at -1 because arrays are 0-indexed
    public currentRound: number = 0
    public currentRoundData?: World
    public worldMap: WorldMap
    private simPaused: boolean = false
    private renderRoundZero: boolean = true

    constructor(public readonly world: WorldMap) {
        this.worldMap = world
    }

    addEvent(event: RoundData) {
        if (!event.event_type.startsWith('Round')) return

        this.rounds.push(event.after_world)
        this.maxRounds++

        // This is to update the max rounds in the control bar
        dispatchEvent(EventType.RENDER, {})
    }

    getGridInfoAtGridCell(x: number, y: number): GridCellDict {
        if (!this.currentRoundData) {
            const grid_type = this.worldMap.getGridType(x, y)
            const stack = this.worldMap.stacks.find((g) => g.grid_loc.x === x && g.grid_loc.y === y)!
            return { grid_type, stack }
        }
        return this.currentRoundData.grid_data.find(
            (cell) => cell.stack.grid_loc.x === x && cell.stack.grid_loc.y === y
        )!
    }

    getGridLayersAtGridCell(x: number, y: number): StackContent[] {
        if (!this.currentRoundData) {
            const stack = this.worldMap.stacks.find((g) => g.grid_loc.x === x && g.grid_loc.y === y)!
            return stack.contents.slice().reverse()
        }
        return this.currentRoundData.grid_data.find(
            (cell) => cell.stack.grid_loc.x === x && cell.stack.grid_loc.y === y
        )!.stack.contents
    }

    getAgentsAtGridCell(x: number, y: number): AgentInfoDict[] {
        return this.currentRoundData?.agent_data.filter((agent) => agent.x === x && agent.y === y) || []
    }

    getAgentFromIds(id: number, gid: number): AgentInfoDict | undefined {
        return this.currentRoundData?.agent_data.find((agent) => agent.id === id && agent.gid === gid)
    }

    renderNextRound() {
        if (this.simPaused || this.isGameOver()) return

        if (this.renderRoundZero) {
            this.renderRoundZero = false
            this.jumpToRound(0)
            return
        }
        this.jumpToRound(this.currentRound + 1)
    }

    jumpToRound(round: number) {
        const newRound = Math.max(0, Math.min(round, this.maxRounds))
        if (newRound === this.currentRound && newRound !== 0) return
        this.currentRound = newRound

        this.currentRoundData = this.rounds[this.currentRound]

        dispatchEvent(EventType.RENDER, {})
        if (this.currentRoundData.top_layer_rem_data) dispatchEvent(EventType.RENDER_STACK, {})
    }

    isGameOver(): boolean {
        return this.currentRound >= this.maxRounds
    }
}
