import { AgentInfoDict, CellDict, Groups, Round, RoundData, World } from '@/core/simulation/'
import { SpawnZoneTypes, StackContent, WorldMap } from '@/core/world'

export class WorldDataManager {
    private currentRoundData?: World
    private currentGroupsData?: Groups
    private rounds: Round[] = []

    constructor(private readonly worldMap: WorldMap) {}

    /**
     * Adds a new round of data to the rounds list.
     * @param {RoundData} roundData - The data representing the new round.
     */
    addRound(roundData: RoundData): void {
        this.rounds.push([roundData.after_world, roundData.groups_data as Groups])
    }

    /**
     * Updates the current round data and group data to match the specified round index.
     * @param {number} roundIndex - The index of the round to load.
     */
    updateCurrentRoundData(roundIndex: number): void {
        if (roundIndex < 0 || roundIndex >= this.rounds.length) return
        ;[this.currentRoundData, this.currentGroupsData] = this.rounds[roundIndex]
    }

    /**
     * Retrieves information about a cell at the given coordinates.
     * @param {number} x - The x-coordinate of the cell.
     * @param {number} y - The y-coordinate of the cell.
     * @returns {CellDict} The cell data dictionary.
     */
    getCellInfo(x: number, y: number): CellDict {
        if (!this.currentRoundData) {
            return this.getInitialCellInfo(x, y)
        }
        return this.getCurrentCellInfo(x, y)
    }

    /**
     * Retrieves initial state information about a cell at the given coordinates.
     * @param {number} x - The x-coordinate of the cell.
     * @param {number} y - The y-coordinate of the cell.
     * @returns {CellDict} The cell data dictionary from the initial state.
     */
    private getInitialCellInfo(x: number, y: number): CellDict {
        const cell_type = this.worldMap.getCellType(x, y)
        const stack = this.worldMap.stacks.find((g) => g.cell_loc.x === x && g.cell_loc.y === y)!
        return { cell_type, stack }
    }

    /**
     * Retrieves current state information about a cell at the given coordinates.
     * @param {number} x - The x-coordinate of the cell.
     * @param {number} y - The y-coordinate of the cell.
     * @returns {CellDict} The cell data dictionary from the current state.
     */
    private getCurrentCellInfo(x: number, y: number): CellDict {
        return this.currentRoundData!.cell_data.find(
            (cell) => cell.stack.cell_loc.x === x && cell.stack.cell_loc.y === y
        )!
    }

    /**
     * Retrieves the stack layers at a specific cell.
     * @param {number} x - The x-coordinate of the cell.
     * @param {number} y - The y-coordinate of the cell.
     * @returns {StackContent[]} The stack contents at the cell.
     */
    getLayersAtCell(x: number, y: number): StackContent[] {
        if (!this.currentRoundData) {
            return this.getInitialLayers(x, y)
        }
        return this.getCurrentLayers(x, y)
    }

    /**
     * Retrieves initial state information about the initial stack layers at a specific cell.
     * @param {number} x - The x-coordinate of the cell.
     * @param {number} y - The y-coordinate of the cell.
     * @returns {StackContent[]} The initial stack contents.
     */
    private getInitialLayers(x: number, y: number): StackContent[] {
        const stack = this.worldMap.stacks.find((g) => g.cell_loc.x === x && g.cell_loc.y === y)!
        return stack.contents.slice().reverse()
    }

    /**
     * Retrieves current state information about the stack layers at a specific cell.
     * @param {number} x - The x-coordinate of the cell.
     * @param {number} y - The y-coordinate of the cell.
     * @returns {StackContent[]} The initial stack contents.
     */
    private getCurrentLayers(x: number, y: number): StackContent[] {
        return this.currentRoundData!.cell_data.find(
            (cell) => cell.stack.cell_loc.x === x && cell.stack.cell_loc.y === y
        )!.stack.contents
    }

    /**
     * Retrieves agents located at a specific cell.
     * @param {number} x - The x-coordinate of the cell.
     * @param {number} y - The y-coordinate of the cell.
     * @returns {AgentInfoDict[]} An array of agents at the cell.
     */
    getAgentsAtLocation(x: number, y: number): AgentInfoDict[] {
        return this.currentRoundData?.agent_data.filter((agent) => agent.x === x && agent.y === y) || []
    }

    /**
     * Retrieves an agent by its ID and group ID.
     * @param {number} id - The agent's unique ID.
     * @param {number} gid - The agent's group ID.
     * @returns {AgentInfoDict | undefined} The agent information, or undefined if not found.
     */
    getAgentFromIds(id: number, gid: number): AgentInfoDict | undefined {
        return this.currentRoundData?.agent_data.find((agent) => agent.id === id && agent.gid === gid)
    }

    /**
     * Retrieves spawn zone information for a specific cell.
     * @param {number} x - The x-coordinate of the cell.
     * @param {number} y - The y-coordinate of the cell.
     * @returns {{ type: SpawnZoneTypes; groups: number[] } | undefined} Spawn zone data or undefined.
     */
    getSpawnInfo(x: number, y: number): { type: SpawnZoneTypes; groups: number[] } | undefined {
        if (!this.currentRoundData) {
            const key = JSON.stringify({ x, y })
            return this.worldMap.spawnCells.get(key)
        }
        return undefined
    }

    /**
     * Retrieves the data for the current round's world state.
     * @returns {World | undefined} The current round data, or undefined if unavailable.
     */
    getCurrentRoundData(): World | undefined {
        return this.currentRoundData
    }

    /**
     * Retrieves the data for the current round's groups.
     * @returns {Groups | undefined} The current groups data, or undefined if unavailable.
     */
    getCurrentGroupsData(): Groups | undefined {
        return this.currentGroupsData
    }
}
