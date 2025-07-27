export enum TabNames {
  Aegis = 'Aegis',
  Game = 'Game',
  Editor = 'Editor',
  Settings = 'Settings'
}

export enum BrushType {
  Zone = 'Zone',
  Layers = 'Layers',
  MoveCost = 'MoveCost'
}

const shadesOfBrown = [
  [188, 104, 29],
  [171, 95, 26],
  [154, 85, 24],
  [137, 76, 21],
  [120, 67, 18],
  [111, 60, 13],
  [102, 54, 10],
  [93, 48, 7],
  [79, 40, 5],
  [65, 32, 2]
]

const shadesOfBlue = [
  [188, 104, 29],
  [171, 95, 26],
  [154, 85, 24],
  [137, 76, 21],
  [120, 67, 18],
  [111, 60, 13],
  [80, 80, 135],
  [60, 60, 115],
  [40, 40, 95],
  [20, 20, 75]
]

// Move cost 1 = lightest, move cost 10+ = darkest
export function getMoveCostColor(
  moveCost: number,
  brownOrBlue: string
): [number, number, number] {
  const colourList = brownOrBlue === 'brown' ? shadesOfBrown : shadesOfBlue
  const index = Math.min(Math.max(moveCost, 1), 10) - 1
  return colourList[index] as [number, number, number]
}

export type Config = {
  Send_Message: {
    enabled: boolean
    target: string
  }
  Sleep_On_Every: boolean
  Save_Surv: {
    strategy: string
    tie_strategy: string
  }
  Enable_Move_Cost: boolean
}

export type ConsoleLine = {
  has_error: boolean
  message: string
}
