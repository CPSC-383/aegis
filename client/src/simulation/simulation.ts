import { EventType, dispatchEvent } from '@/events'
import { WorldMap } from './world-map'
import { World, RoundData, AgentInfoDict, GridCellDict, StackContent } from '@/utils/types'

export class Simulation {
    private rounds: World[] = []
    // The maxRounds can be smaller than the amount of rounds set by the user.
    // (Sim ended early because all survivors were saved or agents all died) ((round sim ended))
    public maxRounds: number = 0
    public currentRound: number = 0
    private renderingBefore: boolean = true
    public currentRoundData?: World
    public worldMap: WorldMap
    private simPaused: boolean = false

    constructor(public readonly world: WorldMap) {
        this.worldMap = world
    }

    addEvent(event: RoundData) {
        if (!event.event_type.startsWith('Round')) return

        this.rounds.push(event.before_world)
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

        if (this.currentRound < this.maxRounds) {
            this.currentRoundData = this.rounds[this.currentRound]
        }

        const top_layer_rem_data = this.currentRoundData?.top_layer_rem_data
        if (top_layer_rem_data) dispatchEvent(EventType.RENDER_STACK, {})

        dispatchEvent(EventType.RENDER, {})
    }

    jumpToRound(round: number) {
        if (round === this.currentRound) return

        this.currentRound = Math.max(0, Math.min(round, this.maxRounds))
        this.currentRoundData = this.rounds[this.currentRound]

        // Rerender so timeline and game update if sim is paused
        dispatchEvent(EventType.RENDER, {})
        if (this.currentRoundData) dispatchEvent(EventType.RENDER_STACK, {})
    }

    isGameOver(): boolean {
        return this.currentRound >= this.maxRounds
    }
}
