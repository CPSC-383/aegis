import { schema } from "aegis-schema"
import Round from "./Round"

enum Layers {
  SURVIVOR,
  RUBBLE
}

export enum EditorBrushTypes {
  POSITIVE_INTEGER,
  SINGLE_SELECT
}

export type EditorFieldBase = {
  type: EditorBrushTypes
  value: any
  label: string
  visibleIf?: (fields: Record<string, EditorField>) => boolean
  options?: { value: any, label: string }[]
}

export type EditorField = EditorFieldBase & {
  type: EditorBrushTypes.POSITIVE_INTEGER | EditorBrushTypes.SINGLE_SELECT
}

export abstract class EditorBrush {
  abstract readonly name: string
  abstract readonly cells: any[]
  abstract readonly fields: Record<string, EditorField>
  abstract apply(x: number, y: number, fields: Record<string, EditorField>): void
  public open: boolean = false

  withOpen(open: boolean): this {
    const clone = Object.create(Object.getPrototypeOf(this))
    Object.assign(clone, this, { open })
    return clone
  }
}

export class ZoneBrush extends EditorBrush {
  name = "Zone"
  cells: schema.Cell[]

  public readonly fields: Record<string, EditorField> = {
    zoneType: {
      type: EditorBrushTypes.SINGLE_SELECT,
      value: schema.CellType.SPAWN,
      label: "Zone Type",
      options: [
        { value: schema.CellType.SPAWN, label: "Spawn" },
        { value: schema.CellType.KILLER, label: "Killer" },
        { value: schema.CellType.CHARGING, label: "Charging" },
      ]
    }
  }

  constructor(round: Round) {
    super()
    this.cells = round.game.world.cells
  }

  apply(x: number, y: number, fields: Record<string, EditorField>): void {
  }
}

export class SurvivorBrush extends EditorBrush {
  name = "Survivor"
  cells: schema.Cell[]

  fields: Record<string, EditorField> = {
    survivorHP: {
      type: EditorBrushTypes.POSITIVE_INTEGER,
      value: 1,
      label: "Survivor HP"
    }
  }

  constructor(round: Round) {
    super()
    this.cells = round.game.world.cells
  }

  apply(x: number, y: number, fields: Record<string, EditorField>) {
  }
}

export class RubbleBrush extends EditorBrush {
  name = "Rubble"
  cells: schema.Cell[]

  fields: Record<string, EditorField> = {
    rubbleEnergyRequired: {
      type: EditorBrushTypes.POSITIVE_INTEGER,
      value: 1,
      label: "Energy Required"
    },
    rubbleAgentRequired: {
      type: EditorBrushTypes.POSITIVE_INTEGER,
      value: 1,
      label: "Agents Required"
    }
  }

  constructor(round: Round) {
    super()
    this.cells = round.game.world.cells
  }

  apply(x: number, y: number, fields: Record<string, EditorField>) {
  }
}

export class MoveCostBrush extends EditorBrush {
  name = "Move Cost"
  cells: schema.Cell[]

  public readonly fields: Record<string, EditorField> = {
    moveCost: {
      type: EditorBrushTypes.POSITIVE_INTEGER,
      value: 1,
      label: "Move Cost"
    }
  }

  constructor(round: Round) {
    super()
    this.cells = round.game.world.cells
  }

  apply(x: number, y: number, fields: Record<string, EditorField>): void {
  }
}
