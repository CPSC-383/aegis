import { TILE_SIZE } from '@/utils/constants'
import { Runner } from './Runner'
import { CanvasLayers, Size, Vector } from '@/types'
import { loadImage } from '@/utils/util'

import goobA from '@/assets/goob-team-a.png'
import goobB from '@/assets/goob-team-b.png'
import survivor from '@/assets/survivor.png'
import { ListenerKey, notify } from './Listeners'
import { renderCoords } from '@/utils/renderUtils'

class RendererClass {
  private canvases: Record<keyof typeof CanvasLayers, HTMLCanvasElement> = {} as any
  private fullRedraw = false
  private mouseTile: Vector | undefined = undefined

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
    const canvasArray = Object.values(this.canvases)
    const topCanvas = canvasArray[canvasArray.length - 1]
    topCanvas.onmousedown = (e) => this.mouseDown(e)

    loadImage(goobA)
    loadImage(goobB)
    loadImage(survivor)
  }

  renderToContainer(container: HTMLDivElement | null): void {
    if (!container) return
    Object.values(this.canvases).forEach((canvas) => {
      container.appendChild(canvas)
    })
  }

  doFullRedraw(): void {
    this.fullRedraw = true
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
    round.agents.draw(game, actx)

    const full = this.fullRedraw
    this.fullRedraw = false
    round.world.drawLayers(game, lctx, full)
  }

  onGameChange() {
    const game = Runner.game
    if (!game) return
    this.fullRedraw = true
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

  private mouseDown(e: MouseEvent) {
    this.mouseTile = this.eventToPoint(e)
    notify(ListenerKey.Canvas)
  }

  public getMouseTile(): Vector | undefined {
    return this.mouseTile
  }

  private eventToPoint(e: MouseEvent): Vector | undefined {
    const canvas = e.target as HTMLCanvasElement
    const rect = canvas.getBoundingClientRect()
    const world = Runner.game?.world
    if (!world) return undefined

    const normX = (e.clientX - rect.left) / rect.width
    const normY = (e.clientY - rect.top) / rect.height
    const { width, height } = world.size

    const xx = Math.floor(normX * width)
    const yy = Math.floor(normY * height)
    const { x, y } = renderCoords(xx, yy, world.size)

    if (x < 0 || y < 0 || x >= width || y >= height) {
      return undefined
    }

    return { x, y }
  }
}

export const Renderer = new RendererClass()
