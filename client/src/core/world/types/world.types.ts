import { Location as ProtobufLocation } from 'aegis-schema'

export type Size = {
  width: number
  height: number
}

// Use the protobuf Location type
export type Location = ProtobufLocation

export type Arguments =
  | 'energy_level'
  | 'number_of_survivors'
  | 'energy_required'
  | 'agents_required'

export type CellContent = {
  type: string
  arguments: {
    [key in Arguments]?: number
  }
}

export type Spawn = {
  x: number
  y: number
  gid?: number
  type: SpawnZoneTypes
}

export type RubbleInfo = {
  energy_required: number
  agents_required: number
}

export type SurvivorInfo = {
  energy_level: number
}

export enum SpawnZoneTypes {
  Any = 'any',
  Group = 'group'
}

export type SpawnZoneData = {
  type: SpawnZoneTypes
  groups: number[]
}

export interface CellTypeMap {
  [key: string]: {
    color: string
    cells: Location[]
  }
}
