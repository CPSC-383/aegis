import { Size } from '@/core/world'
import { getImage } from './util'
import goobSpriteSheetSrc from '@/assets/goobs/goob-sprite-Sheet.png'

export const drawAgent = (
  ctx: CanvasRenderingContext2D,
  id: number,
  x: number,
  y: number,
  agentSize: number
) => {
  // good-sprite-sheet is a spritesheet containing 32x32 images of goob,
  // each of the 8 columns is a different team, and each row is a different goob type

  const goobSpriteSheet = getImage(goobSpriteSheetSrc)
  if (!goobSpriteSheet) return

  // gid 1 gets the first column, gid 2 gets the second column, etc.
  const goobSpritesheetX = (id - 1) % 8
  const goobSpritesheetY = 0
  const goobWidth = 32
  const goobHeight = 32

  ctx.drawImage(
    goobSpriteSheet,
    goobSpritesheetX * goobWidth,
    goobSpritesheetY * goobHeight,
    goobWidth,
    goobHeight,
    x,
    y,
    agentSize,
    agentSize
  )
}

export const renderCoords = (x: number, y: number, size: Size) => {
  return { x, y: size.height - y - 1 }
}
