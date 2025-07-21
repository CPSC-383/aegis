import {
  CellContent,
  Location,
  RubbleInfo,
  Layers,
  SurvivorInfo,
  WorldMap
} from '@/core/world'
import { CellContentBrushTypes } from '@/types'
import { ASSIGNMENT_A1, getCurrentAssignment } from '@/utils/util'
import BrushHandler from './BrushHandler'

class StackContentHandler extends BrushHandler {
  constructor(
    worldMap: WorldMap,
    private stackType: CellContentBrushTypes,
    private rubbleInfo: RubbleInfo,
    private survivorInfo: SurvivorInfo
  ) {
    super(worldMap)
  }

  handle(tile: Location, rightClicked: boolean): void {
    const stack = this.getStack(tile)
    if (!stack) return

    if (rightClicked) {
      // Remove the most recently added content that matches the current brush type (FIFO)
      // Find the last occurrence of the content type (most recently added)
      let contentIndex = -1
      for (let i = stack.contents.length - 1; i >= 0; i--) {
        const content = stack.contents[i]
        if (this.stackType === CellContentBrushTypes.Rubble && content.type === 'rb') {
          contentIndex = i
          break
        } else if (
          this.stackType === CellContentBrushTypes.Survivor &&
          content.type === 'sv'
        ) {
          contentIndex = i
          break
        }
      }

      if (contentIndex !== -1) {
        stack.contents.splice(contentIndex, 1)
      }
      return
    }

    // Check if the cell is occupied by special cells
    if (this.isOccupied(tile)) {
      return
    }

    // Allow adding multiple items of the same type
    this.addStackContent(stack)
  }

  private addStackContent(stack: Layers): void {
    const { spawnCells } = this.worldMap
    const key = JSON.stringify(stack.cell_loc)

    if (spawnCells.get(key)) return
    if (getCurrentAssignment() === ASSIGNMENT_A1) {
      const hasSurvivorOnMap = this.worldMap.stacks.some((stack) =>
        stack.contents.some(
          (content: CellContent) => content.type.toLowerCase() === 'sv'
        )
      )

      if (hasSurvivorOnMap) return
    }

    const content = {
      [CellContentBrushTypes.Rubble]: {
        type: 'rb',
        arguments: this.rubbleInfo
      },
      [CellContentBrushTypes.Survivor]: {
        type: 'sv',
        arguments: this.survivorInfo
      }
    }[this.stackType]

    if (content) {
      stack.contents.push(content)
    }
  }
}

export default StackContentHandler
