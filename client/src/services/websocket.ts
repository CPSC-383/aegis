import { Game } from '@/core/game'
import { WorldMap } from '@/core/world'
import { Event } from "aegis-schema"

export class ClientWebSocket {
  private url: string = 'ws://localhost:6003'
  private reconnectInterval: number = 500
  private game: Game | undefined = undefined
  private started: boolean = false

  constructor(readonly onSimCreated: (sim: Game) => void) {
    this.connect()
  }

  private connect() {
    const ws: WebSocket = new WebSocket(this.url)

    ws.onopen = () => {
      console.log(`Connected to ${this.url}`)
    }

    ws.onmessage = (event) => {
      this.handleEvent(event.data)
    }

    ws.onclose = () => {
      this.game = undefined
      this.started = false
      setTimeout(() => this.connect(), this.reconnectInterval)
    }
  }

  private handleEvent(data: string) {
    try {
      const decoded = Uint8Array.from(atob(data), (c) => c.charCodeAt(0));
      const event = Event.fromBinary(decoded)

      if (!this.game) {
        if (event.event.oneofKind !== "gameHeader") {
          throw new Error("First event must be the GameHeader.")
        }

        const world = WorldMap.fromPb(event.event.gameHeader.world!)
        this.game = new Game(world)
        this.onSimCreated(this.game)
        return
      }

      this.game.addEvent(event)

      if (event.event.oneofKind === "round") {
        if (!this.started) {
          this.started = true
          this.game.renderNextRound()
        }
      }

      if (event.event.oneofKind === "gameFooter")
        this.game = undefined

    } catch (error) {
      console.error('Failed to handle websocket event:', error)
    }
  }
}
