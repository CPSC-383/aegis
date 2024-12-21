import { AgentInfoDict, CellDict, Groups, Round, RoundData, World } from '@/core/simulation/'
import { SpawnZoneTypes, StackContent, WorldMap } from '@/core/world'

export class WorldDataManager {
    private currentRoundData?: World
    private currentGroupsData?: Groups
    private rounds: Round[] = []
    constructor(private readonly worldMap: WorldMap) {}

    addRound(roundData: RoundData): void {
        this.rounds.push([roundData.after_world, roundData.groups_data as Groups])
    }

    updateCurrentRoundData(roundIndex: number): void {
        if (roundIndex < 0 || roundIndex >= this.rounds.length) return
        ;[this.currentRoundData, this.currentGroupsData] = this.rounds[roundIndex]
    }

    getCellInfo(x: number, y: number): CellDict {
        if (!this.currentRoundData) {
            return this.getInitialCellInfo(x, y)
        }
        return this.getCurrentCellInfo(x, y)
    }

    private getInitialCellInfo(x: number, y: number): CellDict {
        const cell_type = this.worldMap.getCellType(x, y)
        const stack = this.worldMap.stacks.find((g) => g.cell_loc.x === x && g.cell_loc.y === y)!
        return { cell_type, stack }
    }

    private getCurrentCellInfo(x: number, y: number): CellDict {
        return this.currentRoundData!.cell_data.find(
            (cell) => cell.stack.cell_loc.x === x && cell.stack.cell_loc.y === y
        )!
    }

    getLayersAtCell(x: number, y: number): StackContent[] {
        if (!this.currentRoundData) {
            return this.getInitialLayers(x, y)
        }
        return this.getCurrentLayers(x, y)
    }

    private getInitialLayers(x: number, y: number): StackContent[] {
        const stack = this.worldMap.stacks.find((g) => g.cell_loc.x === x && g.cell_loc.y === y)!
        return stack.contents.slice().reverse()
    }

    private getCurrentLayers(x: number, y: number): StackContent[] {
        return this.currentRoundData!.cell_data.find(
            (cell) => cell.stack.cell_loc.x === x && cell.stack.cell_loc.y === y
        )!.stack.contents
    }

    getAgentsAtLocation(x: number, y: number): AgentInfoDict[] {
        return this.currentRoundData?.agent_data.filter((agent) => agent.x === x && agent.y === y) || []
    }

    getAgentFromIds(id: number, gid: number): AgentInfoDict | undefined {
        return this.currentRoundData?.agent_data.find((agent) => agent.id === id && agent.gid === gid)
    }

    getSpawnInfo(x: number, y: number): { type: SpawnZoneTypes; groups: number[] } | undefined {
        if (!this.currentRoundData) {
            const key = JSON.stringify({ x, y })
            return this.worldMap.spawnCells.get(key)
        }
        return undefined
    }

    getCurrentRoundData(): World | undefined {
        return this.currentRoundData
    }

    getCurrentGroupsData(): Groups | undefined {
        return this.currentGroupsData
    }
}
