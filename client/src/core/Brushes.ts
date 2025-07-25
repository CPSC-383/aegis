import { schema } from "aegis-schema"
import Round from "./Round"
import { EditorBrush, EditorBrushTypes, EditorField } from "@/components/editor/EditorBrush"

export class ZoneBrush extends EditorBrush {
  public readonly name = "Zone"
  public readonly cells: schema.Cell[]

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

export class LayersBrush extends EditorBrush {
  public readonly name = "Layers"
  public readonly cells: schema.Cell[]

  public readonly fields: Record<string, EditorField> = {
    layerType: {
      type: EditorBrushTypes.SINGLE_SELECT,
      value: schema.Survivor,
      label: "Layer Type",
      options: [
        { value: schema.Rubble, label: "Rubble" },
        { value: schema.Survivor, label: "Survivor" }
      ]
    },
    survivorHP: {
      type: EditorBrushTypes.POSITIVE_INTEGER,
      value: 1,
      label: 'Survivor HP',
      visibleIf: (fields) => fields.layerType.value === schema.Survivor
    },
    rubbleEnergyRequired: {
      type: EditorBrushTypes.POSITIVE_INTEGER,
      value: 1,
      label: 'Energy Required',
      visibleIf: (fields) => fields.layerType.value === schema.Rubble
    },
    rubbleAgentRequired: {
      type: EditorBrushTypes.POSITIVE_INTEGER,
      value: 1,
      label: 'Agents Required',
      visibleIf: (fields) => fields.layerType.value === schema.Rubble
    }
  }

  constructor(round: Round) {
    super()
    this.cells = round.game.world.cells
  }

  apply(x: number, y: number, fields: Record<string, EditorField>): void {
  }
}

export class MoveCostBrush extends EditorBrush {
  public readonly name = "Move Cost"
  public readonly cells: schema.Cell[]

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
