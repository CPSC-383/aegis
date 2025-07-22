export type Arguments =
  | 'energy_level'
  | 'number_of_survivors'
  | 'energy_required'
  | 'agents_required'

export type RubbleInfo = {
  energy_required: number
  agents_required: number
}

export type SurvivorInfo = {
  energy_level: number
}

export interface CellTypeMap {
  [key: string]: {
    color: string
    cells: Location[]
  }
}
