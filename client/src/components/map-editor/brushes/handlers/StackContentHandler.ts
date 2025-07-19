import {
  CellContent,
  Location,
  RubbleInfo,
  Stack,
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
      // Remove content that matches the current brush type
      const contentIndex = stack.contents.findIndex((content) => {
        if (this.stackType === CellContentBrushTypes.Rubble) {
          return content.type === 'rb'
        } else if (this.stackType === CellContentBrushTypes.Survivor) {
          return content.type === 'sv'
        }
        return false
      })

      if (contentIndex !== -1) {
        stack.contents.splice(contentIndex, 1)
      }
      return
    }

    // Check if the cell is occupied by special cells or already has content of this type
    if (this.isOccupied(tile) || this.hasContentOfType(stack)) {
      return
    }

    this.addStackContent(stack)
  }

  private addStackContent(stack: Stack): void {
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

  private hasContentOfType(stack: Stack): boolean {
    return stack.contents.some((content) => {
      if (this.stackType === CellContentBrushTypes.Rubble) {
        return content.type === 'rb'
      } else if (this.stackType === CellContentBrushTypes.Survivor) {
        return content.type === 'sv'
      }
      return false
    })
  }
}

export default StackContentHandler
