// ----- World Types ----- //
export type Size = {
    width: number
    height: number
}

export type Location = {
    x: number
    y: number
}

export type Arguments =
    | 'energy_level'
    | 'number_of_survivors'
    | 'remove_energy'
    | 'remove_agents'
    | 'damage_factor'
    | 'body_mass'
    | 'mental_state'

export type StackContent = {
    type: string
    arguments: {
        [key in Arguments]?: number
    }
}

export type Stack = {
    cell_loc: Location
    move_cost: number
    contents: StackContent[]
}

export type Spawn = {
    x: number
    y: number
    gid?: number
}

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
    Empty = 'empty'
}

export enum StackContentBrushTypes {
    SurvivorGroup = 'survivor_group',
    Survivor = 'survivor',
    Rubble = 'rubble'
}

export type RubbleInfo = {
    remove_energy: number
    remove_agents: number
}

export type SurvivorInfo = {
    energy_level: number
    damage_factor: number
    body_mass: number
    mental_state: number
}

export type SurvivorGroupInfo = {
    energy_level: number
    number_of_survivors: number
}

// ----- Simulation Types ----- //
export type CellDict = {
    cell_type: string
    stack: Stack
}

export type AgentInfoDict = {
    id: number
    gid: number
    x: number
    y: number
    energy_level: number
    command_sent: string
}

export type World = {
    cell_data: CellDict[]
    agent_data: AgentInfoDict[]
    top_layer_rem_data: Location[]
    number_of_alive_agents: number
    number_of_dead_agents: number
    number_of_survivors: number
    number_of_survivors_alive: number
    number_of_survivors_dead: number
    number_of_survivors_saved_alive: number
    number_of_survivors_saved_dead: number
}

export type GroupData = {
    gid: number
    name: string
    score: number
    number_saved: number
    number_predicted_right: number
    number_predicted_wrong: number
}

export type GroupStats = {
    gid: number
    name: string
    score: number
    SurvivorsSaved: number
    CorrectPredictions: number
    IncorrectPredictions: number
}

export type Groups = GroupData[]

export type Round = [World, Groups]

export type RoundData = {
    event_type: string
    round: number
    after_world: World
    groups_data: Groups
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
