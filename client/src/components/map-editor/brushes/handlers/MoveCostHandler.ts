import { Location, WorldMap } from '@/core/world'
import BrushHandler from './BrushHandler'

class MoveCostHandler extends BrushHandler {
  constructor(
    worldMap: WorldMap,
    private moveCost: number
  ) {
    super(worldMap)
  }

  handle(tile: Location, rightClicked: boolean): void {
    const stack = this.getStack(tile)
    if (stack) {
      stack.move_cost = rightClicked ? 1 : this.moveCost
      this.worldMap.updateMinMaxMoveCosts()
    }
  }
}

export default MoveCostHandler
