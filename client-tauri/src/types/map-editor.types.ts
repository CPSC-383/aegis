export type WorldParams = {
  width: number;
  height: number;
  initialEnergy: number;
  isInitialized: boolean;
};

export enum SpecialCellBrushTypes {
  Killer = "killer",
  Fire = "fire",
  Charging = "charging",
  Spawn = "spawn",
}

export enum BrushType {
  SpecialCells = "special_cells",
  MoveCost = "move_cost",
  StackContents = "stack_contents",
  View = "view",
}

export enum StackContentBrushTypes {
  // SurvivorGroup = 'survivor_group',
  Survivor = "survivor",
  Rubble = "rubble",
}
