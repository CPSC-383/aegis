import World from './World'
// import { EventType, dispatchEvent } from '@/events'
import { schema } from 'aegis-schema'
import Round from "./Round"
import Agents from './Agents'
import Games from './Games'

const SNAPSHOT_INTERVAL = 10

export default class Game {
  public maxRound: number = 1
  public currentRound: Round
  private readonly rounds: schema.Round[] = []
  private readonly snapshots: Round[] = []

  /**
   * Initializes the Simulation with the given world map.
   * @param {Games} games - The games wrapper.
   * @param {World} world - The initial world map for the simulation.
   * @param {Agents} initialAgents - The initial agents that will spawn.
   */
  constructor(
    public readonly games: Games,
    public readonly world: World,
    public initialAgents: Agents
  ) {
    this.currentRound = new Round(this, this.world, 0, initialAgents)
  }

  public static fromSchema(games: Games, header: schema.GameHeader): Game {
    const world = World.fromSchema(header.world!)
    const initialAgents = new Agents(games, header.spawns)
    return new Game(games, world, initialAgents)
  }

  public addRound(round: schema.Round): void {
    if (this.currentRound.round === 0) {
      this.currentRound.startRound(round)
      this.snapshots.push(this.currentRound.copy())
    }
    this.rounds.push(round)
    this.maxRound++
  }

  /**
   * Jumps to a specified round and updates the simulation state.
   * @param {number} round - The round to jump to.
   */
  public jumpToRound(round: number): void {
    round = Math.max(1, Math.min(round, this.maxRound))
    if (round === this.currentRound.round) return

    const snapshot = this.getClosestSnapshot(round)

    const updatingRound =
      this.currentRound.round >= snapshot.round && this.currentRound.round <= round
        ? this.currentRound
        : snapshot.copy()

    while (updatingRound.round < round) {
      const nextDelta = updatingRound.round < this.rounds.length ? this.rounds[updatingRound.round] : null
      updatingRound.startRound(nextDelta)
      if (updatingRound.round % SNAPSHOT_INTERVAL === 0)
        this.snapshots.push(updatingRound.copy())
    }
    this.currentRound = updatingRound
  }

  private getClosestSnapshot(targetRound: number): Round {
    const snapIndex = Math.floor((targetRound - 1) / SNAPSHOT_INTERVAL)
    if (snapIndex < this.snapshots.length)
      return this.snapshots[snapIndex]
    return this.snapshots[this.snapshots.length - 1]
  }

  public initEnergy(): void {
    for (const agent of this.initialAgents.agents.values()) {
      agent.energyLevel = this.world.startEnergy
    }
  }


  // ------- old stuff --------


  //   /**
  //    * Renders the next round in the simulation, if applicable.
  //    */
  //   renderNextRound(): void {
  //     if (this.stateManager.isGameOver()) return
  //
  //     if (this.stateManager.isRoundZero()) {
  //       this.stateManager.setRoundZero(false)
  //       this.jumpToRound(0)
  //       return
  //     }
  //     this.jumpToRound(this.stateManager.getCurrentRound() + 1)
  //   }
  //
  //
  //   /**
  //    * Dispatches updates to render the simulation state.
  //    */
  //   private dispatchUpdates(): void {
  //     dispatchEvent(EventType.RENDER, {})
  //     // Note: protobuf WorldState doesn't have top_layer_rem_data, so we skip this check
  //     // if (currentRoundData?.top_layer_rem_data) {
  //     //     dispatchEvent(EventType.RENDER_STACK, {})
  //     // }
  //   }
  //
  //   /**
  //    * Retrieves calculated statistics for the current simulation state.
  //    * @returns Statistics for the simulation.
  //    */
  //   getStats(): { worldStats: UIWorldStats; groupStats?: GroupStats[] } {
  //     return this.statsCalculator.calculateStats()
  //   }
  //
  //   /**
  //    * Retrieves the cell at the given coordinates.
  //    * @param {number} x - The x-coordinate of the cell.
  //    * @param {number} y - The y-coordinate of the cell.
  //    * @returns {Cell} The cell.
  //    */
  //   getCell(x: number, y: number): schema.Cell {
  //     return this.worldMap.cells[y + x * this.worldMap.width]
  //   }
  //
  //   /**
  //    * Retrieves all agents at a specific cell location.
  //    * @param {number} x - The x-coordinate of the cell.
  //    * @param {number} y - The y-coordinate of the cell.
  //    * @returns {AgentInfoDict[]} List of agents at the cell location.
  //    */
  //   getAgentsAtCell(x: number, y: number): number[] {
  //     return this.worldData.getAgentsAtLocation(x, y)
  //   }
  //
  //   /**
  //    * Retrieves an agent by its ID and group ID.
  //    * @param {number} id - The agent's ID.
  //    * @param {number} gid - The group ID of the agent.
  //    * @returns {AgentInfoDict | undefined} The agent, or undefined if not found.
  //    */
  //   getAgentWithIds(id: number, gid: number): AgentInfoDict | undefined {
  //     return this.worldData.getAgentFromIds(id, gid)
  //   }
  //
  //   /**
  //    * Retrieves all stack layers at a specific cell location.
  //    * @param {number} x - The x-coordinate of the cell.
  //    * @param {number} y - The y-coordinate of the cell.
  //    * @returns {CellContent[]} Stack layers at the cell location.
  //    */
  //   getLayersAtCell(x: number, y: number): schema.WorldObject[] {
  //     return this.worldData.getLayersAtCell(x, y)
  //   }
  //
  //   /**
  //    * Retrieves spawn information at a specific cell location.
  //    * @param {number} x - The x-coordinate of the cell.
  //    * @param {number} y - The y-coordinate of the cell.
  //    * @returns Spawn information at the cell location.
  //    */
  //   getSpawns(x: number, y: number): SpawnZoneData | undefined {
  //     return this.worldData.getSpawnInfo(x, y)
  //   }
  //
  //   /**
  //    * Determines whether the simulation has ended.
  //    * @returns {boolean} True if the simulation is over, false otherwise.
  //    */
  //   isGameOver(): boolean {
  //     return this.stateManager.isGameOver()
  //   }
  //
  //   /**
  //    * Retrieves the current round number.
  //    * @returns {number} The current round number.
  //    */
  //   getRoundNumber(): number {
  //     return this.stateManager.getCurrentRound()
  //   }
  //
  //   /**
  //    * Retrieves the maximum number of rounds in the simulation.
  //    * @returns {number} The maximum number of rounds.
  //    */
  //   getMaxRounds(): number {
  //     return this.stateManager.getMaxRounds()
  //   }
}
