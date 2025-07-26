import { schema } from "aegis-schema"

export enum CanvasLayers {
  Background,
  Layers,
  Agent
}

export type Size = {
  width: number
  height: number
}

export type Vector = {
  x: number,
  y: number
}

export type Arguments =
  | 'energy_level'
  | 'number_of_survivors'
  | 'energy_required'
  | 'agents_required'

export type Rubble = {
  energy_required: number
  agents_required: number
}

export type Survivor = {
  energy_level: number
}

export interface WorldData {
  settings: {
    size: Size
    seed: number
    start_energy: number
  }
  cells: {
    loc: schema.Location
    type?: string
    move_cost: number
    layers: {
      type: "sv" | "rb"
      attributes: Partial<Survivor & Rubble>
    }[]
  }[]
}
