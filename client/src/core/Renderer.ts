import { TILE_SIZE } from '@/utils/constants'
import { Runner } from './Runner'
import { CanvasLayers, Size } from '@/types'
import { loadImage } from '@/utils/util'

import goob from '@/assets/goob.png'
import survivor from '@/assets/survivor.png'

class RendererClass {
  private canvases: Record<keyof typeof CanvasLayers, HTMLCanvasElement> = {} as any
  constructor() {
    const numericLayers = Object.values(CanvasLayers).filter(
      (value) => typeof value === 'number'
    ) as number[]
    numericLayers.forEach((layerValue, index) => {
      const canvas = document.createElement('canvas')
      canvas.style.zIndex = (index + 1).toString()
      canvas.style.position = 'absolute'
      canvas.style.top = '50%'
      canvas.style.left = '50%'
      canvas.style.maxWidth = '100%'
      canvas.style.maxHeight = '100%'
      canvas.style.transform = 'translate(-50%, -50%)'
      const layerKey = CanvasLayers[layerValue] as keyof typeof CanvasLayers
      this.canvases[layerKey] = canvas
    })
    loadImage(goob)
    loadImage(survivor)
  }

  renderToContainer(container: HTMLDivElement | null): void {
    if (!container) return
    Object.values(this.canvases).forEach((canvas) => {
      container.appendChild(canvas)
    })
  }

  ctx(layer: CanvasLayers): CanvasRenderingContext2D | null {
    const canvas = this.canvases[CanvasLayers[layer] as keyof typeof CanvasLayers]
    return canvas.getContext('2d')
  }

  fullRender(): void {
    const ctx = this.ctx(CanvasLayers.Background)
    const game = Runner.game
    if (!ctx || !game) return
    game.currentRound.world.draw(ctx)
    this.render()
  }

  render(): void {
    const actx = this.ctx(CanvasLayers.Agent)
    const lctx = this.ctx(CanvasLayers.Layers)
    const game = Runner.game
    if (!actx || !lctx || !game) return

    const round = game.currentRound
    actx.clearRect(0, 0, actx.canvas.width, actx.canvas.height)
    lctx.clearRect(0, 0, lctx.canvas.width, lctx.canvas.height)
    round.agents.draw(game, actx)
    round.world.drawLayers(lctx)
  }

  onGameChange() {
    const game = Runner.game
    if (!game) return
    this.updateCanvasSize(game.world.size)
    this.fullRender()
  }

  private updateCanvasSize(size: Size) {
    Object.values(this.canvases).forEach((canvas) => {
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      canvas.width = size.width * TILE_SIZE
      canvas.height = size.height * TILE_SIZE
      ctx.scale(TILE_SIZE, TILE_SIZE)
    })
  }
}

export const Renderer = new RendererClass()
