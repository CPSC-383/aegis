import { AgentInfoDict, CellDict, Groups, Round, RoundData } from '@/core/simulation/'
import { CellContent, SpawnZoneData, WorldMap } from '@/core/world'
import { Agent, Cell, WorldState } from '@/generated/aegis'

export class WorldDataManager {
  private currentRoundData?: WorldState
  private currentGroupsData?: Groups
  private rounds: Round[] = []

  constructor(private readonly worldMap: WorldMap) {}

  /**
   * Adds a new round of data to the rounds list.
   * @param {RoundData} roundData - The data representing the new round.
   */
  addRound(roundData: RoundData): void {
    this.rounds.push([roundData.afterWorld!, roundData.groupsData])
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
    const stack = this.worldMap.stacks.find(
      (g) => g.cell_loc.x === x && g.cell_loc.y === y
    )!
    return { cell_type, cell_loc: { x, y }, move_cost: stack.move_cost, arguments: {} }
  }

  /**
   * Retrieves current state information about a cell at the given coordinates.
   * @param {number} x - The x-coordinate of the cell.
   * @param {number} y - The y-coordinate of the cell.
   * @returns {CellDict} The cell data dictionary from the current state.
   */
  private getCurrentCellInfo(x: number, y: number): CellDict {
    // Find the protobuf cell and convert to CellDict format
    const protobufCell = this.currentRoundData!.cells.find(
      (cell: Cell) => cell.location!.x === x && cell.location!.y === y
    )

    if (!protobufCell) {
      throw new Error(`Cell not found at (${x}, ${y})`)
    }

    return {
      cell_type: this.getCellTypeFromProtobuf(protobufCell),
      cell_loc: { x: protobufCell.location!.x, y: protobufCell.location!.y },
      move_cost: protobufCell.moveCost,
      arguments: {}
    }
  }

  /**
   * Gets cell type from protobuf cell data.
   * @param {Cell} cell - The protobuf cell data.
   * @returns {string} The cell type.
   */
  private getCellTypeFromProtobuf(cell: Cell): string {
    if (cell.topLayer.oneofKind === 'survivor') {
      return 'CellType.SURVIVOR_CELL'
    } else if (cell.topLayer.oneofKind === 'rubble') {
      return 'CellType.RUBBLE_CELL'
    }
    return 'CellType.NORMAL_CELL'
  }

  /**
   * Retrieves the stack layers at a specific cell.
   * @param {number} x - The x-coordinate of the cell.
   * @param {number} y - The y-coordinate of the cell.
   * @returns {CellContent[]} The cell contents at the cell.
   */
  getLayersAtCell(x: number, y: number): CellContent[] {
    if (!this.currentRoundData) {
      return this.getInitialLayers(x, y)
    }
    return this.getCurrentLayers(x, y)
  }

  /**
   * Retrieves initial state information about the initial stack layers at a specific cell.
   * @param {number} x - The x-coordinate of the cell.
   * @param {number} y - The y-coordinate of the cell.
   * @returns {CellContent[]} The initial cell contents.
   */
  private getInitialLayers(x: number, y: number): CellContent[] {
    const stack = this.worldMap.stacks.find(
      (g) => g.cell_loc.x === x && g.cell_loc.y === y
    )!
    return stack.contents.slice().reverse()
  }

  /**
   * Retrieves current state information about the stack layers at a specific cell.
   * @param {number} x - The x-coordinate of the cell.
   * @param {number} y - The y-coordinate of the cell.
   * @returns {CellContent[]} The current cell contents.
   */
  private getCurrentLayers(x: number, y: number): CellContent[] {
    // Find the protobuf cell at the given coordinates
    const protobufCell = this.currentRoundData!.cells.find(
      (cell: Cell) => cell.location!.x === x && cell.location!.y === y
    )

    if (!protobufCell) {
      return []
    }

    const layers: CellContent[] = []

    // Convert the top layer to CellContent format
    if (protobufCell.topLayer.oneofKind === 'survivor') {
      layers.push({
        type: 'sv',
        arguments: {
          energy_level: 100 // Default energy level since not available in protobuf
        }
      })
    } else if (protobufCell.topLayer.oneofKind === 'rubble') {
      layers.push({
        type: 'rb',
        arguments: {
          energy_required: 1, // Default energy required since not available in protobuf
          agents_required: 1 // Default agents required since not available in protobuf
        }
      })
    }

    return layers
  }

  /**
   * Retrieves agents located at a specific cell.
   * @param {number} x - The x-coordinate of the cell.
   * @param {number} y - The y-coordinate of the cell.
   * @returns {AgentInfoDict[]} An array of agents at the cell.
   */
  getAgentsAtLocation(x: number, y: number): AgentInfoDict[] {
    return (
      this.currentRoundData?.agents.filter(
        (agent: Agent) => agent.location!.x === x && agent.location!.y === y
      ) || []
    )
  }

  /**
   * Retrieves an agent by its ID and group ID.
   * @param {number} id - The agent's unique ID.
   * @param {number} gid - The agent's group ID.
   * @returns {AgentInfoDict | undefined} The agent information, or undefined if not found.
   */
  getAgentFromIds(id: number, gid: number): AgentInfoDict | undefined {
    return this.currentRoundData?.agents.find(
      (agent: Agent) => agent.agentId!.id === id && agent.agentId!.gid === gid
    )
  }

  /**
   * Retrieves spawn zone information for a specific cell.
   * @param {number} x - The x-coordinate of the cell.
   * @param {number} y - The y-coordinate of the cell.
   * @returns {SpawnZoneData | undefined} Spawn zone data or undefined.
   */
  getSpawnInfo(x: number, y: number): SpawnZoneData | undefined {
    if (!this.currentRoundData) {
      const key = JSON.stringify({ x, y })
      return this.worldMap.spawnCells.get(key)
    }
    return undefined
  }

  /**
   * Retrieves the data for the current round's world state.
   * @returns {WorldState | undefined} The current round data, or undefined if unavailable.
   */
  getCurrentRoundData(): WorldState | undefined {
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
