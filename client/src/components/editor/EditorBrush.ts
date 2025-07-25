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

  public withOpen(open: boolean): this {
    const clone = Object.assign(Object.create(Object.getPrototypeOf(this)), this)
    clone.open = open
    return clone
  }
}
