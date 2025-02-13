import {
  GroupStats,
  Groups,
  World,
  WorldDataManager,
  WorldStats,
} from "@/core/simulation";
import { ASSIGNMENT_A1, getCurrentAssignment } from "@/utils/utils";
import { Footprints, Heart, PersonStanding, Skull, Users } from "lucide-react";

export class StatsCalculator {
  constructor(private readonly worldData: WorldDataManager) {}

  /**
   * Calculates statistics for the current round of the simulation.
   * @returns An object containing worldStats and optionally groupStats.
   */
  calculateStats(): { worldStats: WorldStats; groupStats?: GroupStats[] } {
    const currentRoundData = this.worldData.getCurrentRoundData();
    const currentGroupsData = this.worldData.getCurrentGroupsData();

    if (getCurrentAssignment() === ASSIGNMENT_A1) {
      return this.calculateA1Stats(currentRoundData);
    }
    return this.calculateRegularStats(currentRoundData, currentGroupsData);
  }

  /**
   * Calculates statistics specific to Assignment A1.
   * @param currentRoundData - The current world state data.
   * @returns An object containing world-level statistics for Assignment A1.
   */
  private calculateA1Stats(currentRoundData?: World) {
    const agent = currentRoundData?.agent_data.values().next().value;
    const steps_taken = agent?.steps_taken ?? 0;

    return {
      worldStats: {
        SurvivorsSaved: {
          value: this.calculateTotalSavedSurvivors(currentRoundData),
          icon: Heart,
        },
        StepsTaken: {
          value: steps_taken,
          icon: Footprints,
        },
      },
    };
  }

  /**
   * Calculates regular (non-A1) statistics for the simulation.
   * @param currentRoundData - The current world state data.
   * @param currentGroupsData - The current group state data.
   * @returns An object containing world-level and group-level statistics.
   */
  private calculateRegularStats(
    currentRoundData?: World,
    currentGroupsData?: Groups,
  ) {
    return {
      worldStats: this.calculateWorldStats(currentRoundData),
      groupStats: this.calculateGroupStats(currentGroupsData),
    };
  }

  /**
   * Calculates world-level statistics.
   * @param currentRoundData - The current world state data.
   * @returns An object containing various world-level statistics.
   */
  private calculateWorldStats(currentRoundData?: World): WorldStats {
    return {
      AgentsAlive: {
        value: currentRoundData?.number_of_alive_agents ?? 0,
        icon: Users,
      },
      AgentsDead: {
        value: currentRoundData?.number_of_dead_agents ?? 0,
        icon: Skull,
      },
      TotalSurvivors: {
        value: currentRoundData?.number_of_survivors ?? 0,
        icon: PersonStanding,
      },
      SurvivorsSaved: {
        value: this.calculateTotalSavedSurvivors(currentRoundData),
        icon: Heart,
      },
    };
  }

  /**
   * Calculates the total number of survivors saved in the current world state.
   * @param currentRoundData - The current world state data.
   * @returns The total number of survivors saved (alive and dead).
   */
  private calculateTotalSavedSurvivors(currentRoundData?: World): number {
    return (
      (currentRoundData?.number_of_survivors_saved_alive ?? 0) +
      (currentRoundData?.number_of_survivors_saved_dead ?? 0)
    );
  }

  /**
   * Calculates group-level statistics.
   * @param currentGroupsData - The current group state data.
   * @returns An array of GroupStats objects, each containing statistics for a group.
   */
  private calculateGroupStats(currentGroupsData?: Groups): GroupStats[] {
    if (!currentGroupsData) return [];

    return currentGroupsData.map((group) => ({
      gid: group.gid,
      name: group.name,
      score: group.score,
      SurvivorsSaved: group.number_saved ?? 0,
      CorrectPredictions: group.number_predicted_right ?? 0,
      IncorrectPredictions: group.number_predicted_wrong ?? 0,
    }));
  }
}
