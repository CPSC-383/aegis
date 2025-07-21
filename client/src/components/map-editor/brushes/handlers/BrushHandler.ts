import { Location, Layers, WorldMap } from '@/core/world'

abstract class BrushHandler {
  protected worldMap: WorldMap

  constructor(worldMap: WorldMap) {
    this.worldMap = worldMap
  }

  protected isOccupied(tile: Location): boolean {
    const { killerCells, fireCells, chargingCells } = this.worldMap
    return [killerCells, fireCells, chargingCells].some((cells) =>
      cells.some((cell) => cell.x === tile.x && cell.y === tile.y)
    )
  }

  protected getStack(tile: Location): Layers | undefined {
    return this.worldMap.stacks.find(
      (stack) => stack.cell_loc.x === tile.x && stack.cell_loc.y === tile.y
    )
  }

  abstract handle(tile: Location, rightClicked: boolean): void
}

export default BrushHandler
