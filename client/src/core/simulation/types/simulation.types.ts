import {
    AgentID,
    Location,
    GroupData,
    Agent,
    WorldState,
    SimulationState as ProtobufSimulationState,
    WorldStats as ProtobufWorldStats,
    GroupStats as ProtobufGroupStats,
    RoundData as ProtobufRoundData
} from '@/generated/aegis'
import { ReactNode } from 'react'

// Use protobuf types directly for everything that can be represented in the schema
export type SimulationState = ProtobufSimulationState
export type WorldStats = ProtobufWorldStats
export type GroupStats = ProtobufGroupStats
export type RoundData = ProtobufRoundData

// Client-specific types that extend or combine protobuf types
export type Groups = GroupData[]
export type Agents = Agent[]
export type AgentInfoDict = Agent

// UI-specific types that combine protobuf data with display logic
export interface UIWorldStats {
    agentsAlive: number
    agentsDead: number
    totalSurvivors: number
    survivorsSaved: number
    stepsTaken: number
    AgentsAlive?: { value: number; icon: ReactNode }
    AgentsDead?: { value: number; icon: ReactNode }
    TotalSurvivors?: { value: number; icon: ReactNode }
    SurvivorsSaved?: { value: number; icon: ReactNode }
    StepsTaken?: { value: number; icon: ReactNode }
}

// Cell display information that combines protobuf data with UI logic (cannot put in schema due to dynamic nature)
export interface CellDict {
    cell_type: string
    cell_loc: Location
    move_cost: number
    arguments: Record<string, unknown> // Dynamic object for UI-specific data
}

export type Round = [WorldState, Groups]
