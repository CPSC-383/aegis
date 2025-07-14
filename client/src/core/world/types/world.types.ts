import { Location as ProtobufLocation } from '@/generated/aegis'

export type Size = {
    width: number
    height: number
}

// Use the protobuf Location type
export type Location = ProtobufLocation

export type Arguments = 'energy_level' | 'number_of_survivors' | 'remove_energy' | 'remove_agents'

export type StackContent = {
    type: string
    arguments: {
        [key in Arguments]?: number
    }
}

export type Stack = {
    cell_loc: Location
    move_cost: number
    contents: StackContent[]
}

export type Spawn = {
    x: number
    y: number
    gid?: number
    type: SpawnZoneTypes
}

export type RubbleInfo = {
    remove_energy: number
    remove_agents: number
}

export type SurvivorInfo = {
    energy_level: number
}

export enum SpawnZoneTypes {
    Any = 'any',
    Group = 'group'
}

export interface CellTypeMap {
    [key: string]: {
        color: string
        cells: Location[]
    }
}
