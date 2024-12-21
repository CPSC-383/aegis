// ----- World Types ----- //

// ----- Map Editor Types ----- //
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
    StackContents = 'stack_contents',
    View = 'view'
}

export enum StackContentBrushTypes {
    // SurvivorGroup = 'survivor_group',
    Survivor = 'survivor',
    Rubble = 'rubble'
}

// ----- Extra Types ----- //

export enum TabNames {
    Aegis = 'Aegis',
    Agents = 'Agents',
    Game = 'Game',
    Editor = 'Editor',
    Settings = 'Settings'
}

export const shadesOfBrown = [
    [188, 104, 29], // Light Brown
    [171, 95, 26],
    [154, 85, 24],
    [137, 76, 21],
    [120, 67, 18] // Dark Brown
]

export const shadesOfBlue = [
    [0, 0, 250], // Light Blue
    [0, 0, 230],
    [0, 0, 211],
    [0, 0, 191],
    [0, 0, 171] // Dark Blue
]

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
