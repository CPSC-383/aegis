import { EventType, dispatchEvent } from '@/events'
import { WorldMap } from './world-map'
import {
    World,
    Groups,
    GroupData,
    GroupStats,
    Round,
    RoundData,
    AgentInfoDict,
    CellDict,
    StackContent
} from '@/utils/types'

export class Simulation {
    private rounds: Round[] = []
    public maxRounds: number = -1 // Start this at -1 because arrays are 0-indexed
    public currentRound: number = 0
    private currentRoundData?: World
    private currentGroupsData?: Groups
    public worldMap: WorldMap
    private simPaused: boolean = false
    private renderRoundZero: boolean = true

    constructor(public readonly world: WorldMap) {
        this.worldMap = world
    }

    addEvent(event: RoundData) {
        if (!event.event_type.startsWith('Round')) return

        this.rounds.push([event.after_world, event.groups_data as Groups])
        this.maxRounds++

        // This is to update the max rounds in the control bar
        dispatchEvent(EventType.RENDER, {})
    }

    getInfoAtCell(x: number, y: number): CellDict {
        if (!this.currentRoundData) {
            const cell_type = this.worldMap.getCellType(x, y)
            const stack = this.worldMap.stacks.find((g) => g.cell_loc.x === x && g.cell_loc.y === y)!
            return { cell_type, stack }
        }
        return this.currentRoundData.cell_data.find(
            (cell) => cell.stack.cell_loc.x === x && cell.stack.cell_loc.y === y
        )!
    }

    getLayersAtCell(x: number, y: number): StackContent[] {
        if (!this.currentRoundData) {
            const stack = this.worldMap.stacks.find((g) => g.cell_loc.x === x && g.cell_loc.y === y)!
            return stack.contents.slice().reverse()
        }
        return this.currentRoundData.cell_data.find(
            (cell) => cell.stack.cell_loc.x === x && cell.stack.cell_loc.y === y
        )!.stack.contents
    }

    getAgentsAtCell(x: number, y: number): AgentInfoDict[] {
        return this.currentRoundData?.agent_data.filter((agent) => agent.x === x && agent.y === y) || []
    }

    getAgentFromIds(id: number, gid: number): AgentInfoDict | undefined {
        return this.currentRoundData?.agent_data.find((agent) => agent.id === id && agent.gid === gid)
    }

    public getStats() {
        const stats = {
            worldStats: {
                AgentsAlive: this.currentRoundData?.number_of_alive_agents ?? 0,
                AgentsDead: this.currentRoundData?.number_of_dead_agents ?? 0,
                SurvivorsLeft: this.currentRoundData?.number_of_survivors ?? 0,
                SurvivorsSaved:
                    (this.currentRoundData?.number_of_survivors_saved_alive ?? 0) +
                    (this.currentRoundData?.number_of_survivors_saved_dead ?? 0)
            },
            groupStats: [] as GroupStats[]
        }

        if (this.currentGroupsData) {
            for (const group of this.currentGroupsData) {
                const groupStat = {
                    gid: group.gid,
                    name: group.name,
                    score: group.score,
                    SurvivorsSaved: group.number_saved ?? 0,
                    CorrectPredictions: group.number_predicted_right ?? 0,
                    IncorrectPredictions: group.number_predicted_wrong ?? 0
                }
                stats.groupStats.push(groupStat)
            }
        }

        return stats
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

        // this.currentRoundData = this.rounds[this.currentRound]
        this.currentRoundData = this.rounds[this.currentRound][0]
        this.currentGroupsData = this.rounds[this.currentRound][1]

        dispatchEvent(EventType.RENDER, {})
        if (this.currentRoundData.top_layer_rem_data) dispatchEvent(EventType.RENDER_STACK, {})
    }

    isGameOver(): boolean {
        return this.currentRound >= this.maxRounds
    }
}
