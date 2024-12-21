import { GroupStats, Groups, World, WorldDataManager, WorldStats } from '@/core/simulation'
import { ASSIGNMENT_A1, getCurrentAssignment } from '@/utils/util'
import { Footprints, Heart, PersonStanding, Skull, Users } from 'lucide-react'

export class StatsCalculator {
    constructor(private readonly worldData: WorldDataManager) {}

    calculateStats(): { worldStats: WorldStats; groupStats?: GroupStats[] } {
        const currentRoundData = this.worldData.getCurrentRoundData()
        const currentGroupsData = this.worldData.getCurrentGroupsData()

        if (getCurrentAssignment() === ASSIGNMENT_A1) {
            return this.calculateA1Stats(currentRoundData)
        }
        return this.calculateRegularStats(currentRoundData, currentGroupsData)
    }

    private calculateA1Stats(currentRoundData?: World) {
        const agent = currentRoundData?.agent_data.values().next().value
        const steps_taken = agent?.steps_taken ?? 0

        return {
            worldStats: {
                SurvivorsSaved: {
                    value: this.calculateTotalSavedSurvivors(currentRoundData),
                    icon: Heart
                },
                StepsTaken: {
                    value: steps_taken,
                    icon: Footprints
                }
            }
        }
    }

    private calculateRegularStats(currentRoundData?: World, currentGroupsData?: Groups) {
        return {
            worldStats: this.calculateWorldStats(currentRoundData),
            groupStats: this.calculateGroupStats(currentGroupsData)
        }
    }

    private calculateWorldStats(currentRoundData?: World): WorldStats {
        return {
            AgentsAlive: {
                value: currentRoundData?.number_of_alive_agents ?? 0,
                icon: Users
            },
            AgentsDead: {
                value: currentRoundData?.number_of_dead_agents ?? 0,
                icon: Skull
            },
            TotalSurvivors: {
                value: currentRoundData?.number_of_survivors ?? 0,
                icon: PersonStanding
            },
            SurvivorsSaved: {
                value: this.calculateTotalSavedSurvivors(currentRoundData),
                icon: Heart
            }
        }
    }

    private calculateTotalSavedSurvivors(currentRoundData?: World): number {
        return (
            (currentRoundData?.number_of_survivors_saved_alive ?? 0) +
            (currentRoundData?.number_of_survivors_saved_dead ?? 0)
        )
    }

    private calculateGroupStats(currentGroupsData?: Groups): GroupStats[] {
        if (!currentGroupsData) return []

        return currentGroupsData.map((group) => ({
            gid: group.gid,
            name: group.name,
            score: group.score,
            SurvivorsSaved: group.number_saved ?? 0,
            CorrectPredictions: group.number_predicted_right ?? 0,
            IncorrectPredictions: group.number_predicted_wrong ?? 0
        }))
    }
}
