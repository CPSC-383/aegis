// // import { UIWorldStats, GroupStats, Groups, WorldDataManager } from '@/core/game'
// import { getCurrentAssignment, ASSIGNMENT_A1 } from '@/utils/util'
// import { WorldState, Agent } from '@/generated/aegis'
//
// export class StatsCalculator {
//   constructor(private readonly worldData: WorldDataManager) { }
//
//   /**
//    * Calculates statistics for the current round of the simulation.
//    * @returns An object containing worldStats and optionally groupStats.
//    */
//   calculateStats(): { worldStats: UIWorldStats; groupStats?: GroupStats[] } {
//     const currentRoundData = this.worldData.getCurrentRoundData()
//     const currentGroupsData = this.worldData.getCurrentGroupsData()
//
//     if (getCurrentAssignment() === ASSIGNMENT_A1) {
//       return this.calculateA1Stats(currentRoundData)
//     }
//     return this.calculateRegularStats(currentRoundData, currentGroupsData)
//   }
//
//   /**
//    * Calculates statistics for A1 assignment.
//    * @param currentRoundData - The current round data.
//    * @returns An object containing worldStats.
//    */
//   private calculateA1Stats(currentRoundData?: WorldState): {
//     worldStats: UIWorldStats
//   } {
//     const worldStats = this.calculateBaseStats(currentRoundData)
//     return { worldStats }
//   }
//
//   /**
//    * Calculates statistics for regular assignments.
//    * @param currentRoundData - The current round data.
//    * @param currentGroupsData - The current group state data.
//    * @returns An object containing worldStats and groupStats.
//    */
//   private calculateRegularStats(
//     currentRoundData?: WorldState,
//     currentGroupsData?: Groups
//   ): { worldStats: UIWorldStats; groupStats?: GroupStats[] } {
//     const worldStats = this.calculateBaseStats(currentRoundData)
//     const groupStats = this.calculateGroupStats(currentGroupsData)
//     return { worldStats, groupStats }
//   }
//
//   /**
//    * Calculates base statistics from world state data.
//    * @param currentRoundData - The current round data.
//    * @returns UIWorldStats object with calculated statistics.
//    */
//   private calculateBaseStats(currentRoundData?: WorldState): UIWorldStats {
//     const worldStats: UIWorldStats = {
//       agentsAlive: 0,
//       agentsDead: 0,
//       totalSurvivors: 0,
//       survivorsSaved: 0,
//       stepsTaken: 0,
//       AgentsAlive: { value: 0, icon: null },
//       AgentsDead: { value: 0, icon: null },
//       TotalSurvivors: { value: 0, icon: null },
//       SurvivorsSaved: { value: 0, icon: null },
//       StepsTaken: { value: 0, icon: null }
//     }
//
//     if (currentRoundData) {
//       // Calculate from protobuf data using proper types
//       const aliveAgents = currentRoundData.agents.filter(
//         (agent: Agent) => agent.energyLevel > 0
//       )
//       const deadAgents = currentRoundData.agents.filter(
//         (agent: Agent) => agent.energyLevel <= 0
//       )
//       const totalSteps = currentRoundData.agents.reduce(
//         (sum: number, agent: Agent) => sum + agent.stepsTaken,
//         0
//       )
//
//       worldStats.agentsAlive = aliveAgents.length
//       worldStats.agentsDead = deadAgents.length
//       worldStats.totalSurvivors = currentRoundData.survivors.length
//       worldStats.survivorsSaved = 0 // Will need to be calculated
//       worldStats.stepsTaken = totalSteps
//
//       // UI-specific fields
//       worldStats.AgentsAlive!.value = aliveAgents.length
//       worldStats.AgentsDead!.value = deadAgents.length
//       worldStats.TotalSurvivors!.value = currentRoundData.survivors.length
//       worldStats.SurvivorsSaved!.value = 0 // Will need to be calculated
//       worldStats.StepsTaken!.value = totalSteps
//     }
//
//     return worldStats
//   }
//
//   /**
//    * Calculates group-level statistics.
//    * @param currentGroupsData - The current group state data.
//    * @returns An array of GroupStats objects, each containing statistics for a group.
//    */
//   private calculateGroupStats(currentGroupsData?: Groups): GroupStats[] {
//     if (!currentGroupsData) return []
//
//     return currentGroupsData.map((group) => ({
//       gid: group.gid,
//       name: group.name,
//       score: group.score,
//       survivorsSaved: group.numberSaved,
//       correctPredictions: group.numberPredictedRight,
//       incorrectPredictions: group.numberPredictedWrong
//     }))
//   }
// }
