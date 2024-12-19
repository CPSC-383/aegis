import { Location } from '@/utils/types'
import BrushHandler from './BrushHandler'

class MoveCostHandler extends BrushHandler {
    constructor(
        worldMap: any,
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
