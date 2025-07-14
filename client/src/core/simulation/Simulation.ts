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
import { RoundUpdate } from '@/generated/aegis'

export class Simulation {
    private stateManager: SimulationStateManager
    private worldData: WorldDataManager
    private statsCalculator: StatsCalculator
    public readonly worldMap: WorldMap

    /**
     * Initializes the Simulation with the given world map.
     * @param {WorldMap} world - The initial world map for the simulation.
     */
    constructor(public readonly world: WorldMap) {
        this.stateManager = new SimulationStateManager()
        this.worldData = new WorldDataManager(world)
        this.statsCalculator = new StatsCalculator(this.worldData)
        this.worldMap = world
    }

    /**
     * Adds a new protobuf round update event to the simulation.
     * @param {RoundUpdate} roundUpdate - The protobuf round update event to be added.
     */
    addProtobufEvent(roundUpdate: RoundUpdate): void {
        // Convert protobuf data to the internal format
        const roundData: RoundData = {
            event_type: 'RoundUpdate',
            round: roundUpdate.round,
            after_world: this.convertProtobufWorldStateToWorld(roundUpdate.world!),
            groups_data: roundUpdate.groups // Use the protobuf groups directly
        }

        this.addEvent(roundData)
    }

    /**
     * Converts protobuf WorldState to internal World format.
     * @param {WorldState} worldState - The protobuf world state.
     * @returns {World} The internal world format.
     */
    private convertProtobufWorldStateToWorld(worldState: any): any {
        // Convert protobuf cells to cell_data format
        const cell_data = worldState.cells.map((cell: any) => ({
            cell_type: this.getCellTypeFromProtobuf(cell),
            stack: {
                cell_loc: { x: cell.location!.x, y: cell.location!.y },
                move_cost: cell.moveCost,
                contents: [] // Will need to be populated based on cell contents
            }
        }))

        // Convert protobuf agents to agent_data format
        const agent_data = worldState.agents.map((agent: any) => ({
            id: agent.agentId!.id,
            gid: agent.agentId!.gid,
            x: agent.location!.x,
            y: agent.location!.y,
            energy_level: agent.energyLevel,
            command_sent: '', // Not available in protobuf
            steps_taken: agent.stepsTaken
        }))

        return {
            cell_data,
            agent_data,
            top_layer_rem_data: [], // Will need to be populated
            number_of_alive_agents: agent_data.filter((a: any) => a.energy_level > 0).length,
            number_of_dead_agents: agent_data.filter((a: any) => a.energy_level <= 0).length,
            number_of_survivors: worldState.survivors.length,
            number_of_survivors_alive: worldState.survivors.filter((s: any) => s.state === 0).length,
            number_of_survivors_dead: worldState.survivors.filter((s: any) => s.state === 1).length,
            number_of_survivors_saved_alive: 0, // Will need to be calculated
            number_of_survivors_saved_dead: 0 // Will need to be calculated
        }
    }

    /**
     * Gets cell type from protobuf cell data.
     * @param {any} cell - The protobuf cell data.
     * @returns {string} The cell type.
     */
    private getCellTypeFromProtobuf(cell: any): string {
        if (cell.topLayer.oneofKind === 'survivor') {
            return 'CellType.SURVIVOR_CELL'
        } else if (cell.topLayer.oneofKind === 'rubble') {
            return 'CellType.RUBBLE_CELL'
        }
        return 'CellType.NORMAL_CELL'
    }

    /**
     * Adds a new round event to the simulation.
     * @param {RoundData} event - The round event to be added.
     */
    addEvent(event: RoundData): void {
        if (!event.event_type.startsWith('Round')) return

        this.worldData.addRound(event)
        this.stateManager.incrementMaxRounds()
        dispatchEvent(EventType.RENDER, {})
    }

    /**
     * Renders the next round in the simulation, if applicable.
     */
    renderNextRound(): void {
        if (this.stateManager.isGameOver()) return

        if (this.stateManager.isRoundZero()) {
            this.stateManager.setRoundZero(false)
            this.jumpToRound(0)
            return
        }
        this.jumpToRound(this.stateManager.getCurrentRound() + 1)
    }

    /**
     * Jumps to a specified round and updates the simulation state.
     * @param {number} round - The round to jump to.
     */
    jumpToRound(round: number): void {
        const currentRound = this.stateManager.getCurrentRound()
        this.stateManager.setCurrentRound(round)

        if (round === currentRound && round !== 0) return

        this.worldData.updateCurrentRoundData(round)
        this.dispatchUpdates()
    }

    /**
     * Dispatches updates to render the simulation state.
     */
    private dispatchUpdates(): void {
        dispatchEvent(EventType.RENDER, {})
        const currentRoundData = this.worldData.getCurrentRoundData()
        if (currentRoundData?.top_layer_rem_data) {
            dispatchEvent(EventType.RENDER_STACK, {})
        }
    }

    /**
     * Retrieves calculated statistics for the current simulation state.
     * @returns Statistics for the simulation.
     */
    getStats() {
        return this.statsCalculator.calculateStats()
    }

    /**
     * Retrieves information about a cell at a specific location.
     * @param {number} x - The x-coordinate of the cell.
     * @param {number} y - The y-coordinate of the cell.
     * @returns {CellDict} Information about the cell.
     */
    getInfoAtCell(x: number, y: number): CellDict {
        return this.worldData.getCellInfo(x, y)
    }

    /**
     * Retrieves all agents at a specific cell location.
     * @param {number} x - The x-coordinate of the cell.
     * @param {number} y - The y-coordinate of the cell.
     * @returns {AgentInfoDict[]} List of agents at the cell location.
     */
    getAgentsAtCell(x: number, y: number): AgentInfoDict[] {
        return this.worldData.getAgentsAtLocation(x, y)
    }

    /**
     * Retrieves an agent by its ID and group ID.
     * @param {number} id - The agent's ID.
     * @param {number} gid - The group ID of the agent.
     * @returns {AgentInfoDict | undefined} The agent, or undefined if not found.
     */
    getAgentWithIds(id: number, gid: number): AgentInfoDict | undefined {
        return this.worldData.getAgentFromIds(id, gid)
    }

    /**
     * Retrieves all stack layers at a specific cell location.
     * @param {number} x - The x-coordinate of the cell.
     * @param {number} y - The y-coordinate of the cell.
     * @returns {StackContent[]} Stack layers at the cell location.
     */
    getLayersAtCell(x: number, y: number): StackContent[] {
        return this.worldData.getLayersAtCell(x, y)
    }

    /**
     * Retrieves spawn information at a specific cell location.
     * @param {number} x - The x-coordinate of the cell.
     * @param {number} y - The y-coordinate of the cell.
     * @returns Spawn information at the cell location.
     */
    getSpawns(x: number, y: number) {
        return this.worldData.getSpawnInfo(x, y)
    }

    /**
     * Determines whether the simulation has ended.
     * @returns {boolean} True if the simulation is over, false otherwise.
     */
    isGameOver(): boolean {
        return this.stateManager.isGameOver()
    }

    /**
     * Retrieves the current round number.
     * @returns {number} The current round number.
     */
    getRoundNumber(): number {
        return this.stateManager.getCurrentRound()
    }

    /**
     * Retrieves the maximum number of rounds in the simulation.
     * @returns {number} The maximum number of rounds.
     */
    getMaxRounds(): number {
        return this.stateManager.getMaxRounds()
    }
}
