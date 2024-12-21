import {
    AgentInfoDict,
    CellDict,
    RoundData,
    SimulationStateManager,
    StatsCalculator,
    WorldDataManager
} from '@/core/simulation'
import { WorldMap, StackContent } from '@/core/world'
import { EventType, dispatchEvent } from '@/events'

export class Simulation {
    private stateManager: SimulationStateManager
    private worldData: WorldDataManager
    private statsCalculator: StatsCalculator
    public readonly worldMap: WorldMap

    constructor(public readonly world: WorldMap) {
        this.stateManager = new SimulationStateManager()
        this.worldData = new WorldDataManager(world)
        this.statsCalculator = new StatsCalculator(this.worldData)
        this.worldMap = world
    }

    addEvent(event: RoundData): void {
        if (!event.event_type.startsWith('Round')) return

        this.worldData.addRound(event)
        this.stateManager.incrementMaxRounds()
        dispatchEvent(EventType.RENDER, {})
    }

    renderNextRound(): void {
        if (this.stateManager.isGameOver()) return

        if (this.stateManager.isRoundZero()) {
            this.stateManager.setRoundZero(false)
            this.jumpToRound(0)
            return
        }
        this.jumpToRound(this.stateManager.getCurrentRound() + 1)
    }

    jumpToRound(round: number): void {
        const currentRound = this.stateManager.getCurrentRound()
        this.stateManager.setCurrentRound(round)

        if (round === currentRound && round !== 0) return

        this.worldData.updateCurrentRoundData(round)
        this.dispatchUpdates()
    }

    private dispatchUpdates(): void {
        dispatchEvent(EventType.RENDER, {})
        const currentRoundData = this.worldData.getCurrentRoundData()
        if (currentRoundData?.top_layer_rem_data) {
            dispatchEvent(EventType.RENDER_STACK, {})
        }
    }

    getStats() {
        return this.statsCalculator.calculateStats()
    }

    getInfoAtCell(x: number, y: number): CellDict {
        return this.worldData.getCellInfo(x, y)
    }

    getAgentsAtCell(x: number, y: number): AgentInfoDict[] {
        return this.worldData.getAgentsAtLocation(x, y)
    }

    getAgentWithIds(id: number, gid: number): AgentInfoDict | undefined {
        return this.worldData.getAgentFromIds(id, gid)
    }

    getLayersAtCell(x: number, y: number): StackContent[] {
        return this.worldData.getLayersAtCell(x, y)
    }

    getSpawns(x: number, y: number) {
        return this.worldData.getSpawnInfo(x, y)
    }

    isGameOver(): boolean {
        return this.stateManager.isGameOver()
    }

    getRoundNumber(): number {
        return this.stateManager.getCurrentRound()
    }

    getMaxRounds(): number {
        return this.stateManager.getMaxRounds()
    }
}
