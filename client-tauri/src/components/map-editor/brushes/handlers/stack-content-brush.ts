import { StackContentBrushTypes } from "@/types";
import { RubbleInfo, SurvivorInfo, Location, Stack } from "@/core/world";
import BrushHandler from "./brush-handler";
import { ASSIGNMENT_A1, getCurrentAssignment } from "@/utils/utils";

class StackContentHandler extends BrushHandler {
  constructor(
    worldMap: any,
    private stackType: StackContentBrushTypes,
    private rubbleInfo: RubbleInfo,
    private survivorInfo: SurvivorInfo,
  ) {
    super(worldMap);
  }

  handle(tile: Location, rightClicked: boolean): void {
    const stack = this.getStack(tile);
    if (!stack) return;

    if (rightClicked && stack.contents.length > 0) {
      stack.contents.pop();
      return;
    }

    if (!this.isOccupied(tile)) {
      this.addStackContent(stack);
    }
  }

  private addStackContent(stack: Stack): void {
    const { spawnCells } = this.worldMap;
    const key = JSON.stringify(stack.cell_loc);

    if (spawnCells.get(key)) return;
    if (getCurrentAssignment() === ASSIGNMENT_A1) {
      const hasSurvivorOnMap = this.worldMap.stacks.some((stack) =>
        stack.contents.some((content) => content.type.toLowerCase() === "sv"),
      );

      if (hasSurvivorOnMap) return;
    }

    const content = {
      [StackContentBrushTypes.Rubble]: {
        type: "rb",
        arguments: this.rubbleInfo,
      },
      [StackContentBrushTypes.Survivor]: {
        type: "sv",
        arguments: this.survivorInfo,
      },
    }[this.stackType];

    if (content) {
      stack.contents.push(content);
    }
  }
}

export default StackContentHandler;
