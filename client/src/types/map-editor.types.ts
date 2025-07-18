export type WorldParams = {
  width: number
  height: number
  initialEnergy: number
  isInitialized: boolean
}

export enum SpecialCellBrushTypes {
  Killer = 'killer',
  Fire = 'fire',
  Charging = 'charging',
  Spawn = 'spawn'
}

export enum BrushType {
  SpecialCells = 'special_cells',
  MoveCost = 'move_cost',
  CellContents = 'cell_contents',
  View = 'view'
}

export enum CellContentBrushTypes {
  Survivor = 'survivor',
  Rubble = 'rubble'
}
