import { schema } from "aegis-schema"
import Round from "./Round"
import World from "./World"

export enum EditorBrushTypes {
  POSITIVE_INTEGER,
  SINGLE_SELECT
}

export type EditorFieldBase = {
  type: EditorBrushTypes
  value: any
  label: string
  options?: { value: any, label: string }[]
}

export type EditorField = EditorFieldBase & {
  type: EditorBrushTypes.POSITIVE_INTEGER | EditorBrushTypes.SINGLE_SELECT
}

export abstract class EditorBrush {
  abstract readonly name: string
  abstract readonly cells: any[]
  abstract readonly fields: Record<string, EditorField>
  abstract apply(x: number, y: number, fields: Record<string, EditorField>, rightClick: boolean): void

  public open: boolean = false
  protected readonly round: Round
  protected readonly world: World
  public nextID: number = 1


  constructor(round: Round) {
    this.round = round
    this.world = round.world
  }

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
    super(round)
    this.cells = round.game.world.cells
  }

  apply(x: number, y: number, fields: Record<string, EditorField>, rightClick: boolean): void {
    const cell = this.world.cellAt(x, y)
    const cellType = fields.zoneType.value as schema.CellType

    if (rightClick) {
      cell.type = schema.CellType.NORMAL
      return
    }

    cell.type = Number(cellType)
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
    super(round)
    this.cells = round.game.world.cells
  }

  apply(x: number, y: number, fields: Record<string, EditorField>, rightClick: boolean) {
    const cell = this.world.cellAt(x, y)
    const hp = fields.survivorHP.value

    if (rightClick) {
      cell.layers.pop()
      return
    }

    const surv: schema.Survivor = schema.Survivor.create({
      id: this.nextID++,
      health: hp,
      state: schema.SurvivorState.ALIVE,
    })

    const worldObject: schema.WorldObject = {
      object: {
        oneofKind: "survivor",
        survivor: surv,
      }
    }

    cell.layers.push(worldObject)
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
    super(round)
    this.cells = round.game.world.cells
  }

  apply(x: number, y: number, fields: Record<string, EditorField>, rightClick: boolean) {
    const cell = this.world.cellAt(x, y)
    const energyRequired = fields.rubbleEnergyRequired.value
    const agentsRequired = fields.rubbleAgentRequired.value

    if (rightClick) {
      cell.layers.pop()
      return
    }
    const rubble: schema.Rubble = schema.Rubble.create({
      id: this.nextID++,
      energyRequired,
      agentsRequired
    })
    const worldObject: schema.WorldObject = {
      object: {
        oneofKind: "rubble",
        rubble
      }
    }

    cell.layers.push(worldObject)
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
    super(round)
    this.cells = round.game.world.cells
  }

  apply(x: number, y: number, fields: Record<string, EditorField>, rightClick: boolean): void {
    const cell = this.world.cellAt(x, y)
    const moveCost = fields.moveCost.value

    if (rightClick) {
      cell.moveCost = 1
    } else {
      cell.moveCost = moveCost
    }

    this.world.updateMinMaxMoveCosts()
  }
}
