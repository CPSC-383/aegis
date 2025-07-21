import { Simulation } from '@/core/simulation'
import { WorldMap } from '@/core/world'
import { Event } from "aegis-schema"

export class ClientWebSocket {
  private url: string = 'ws://localhost:6003'
  private reconnectInterval: number = 500
  private simulation: Simulation | undefined = undefined
  private started: boolean = false

  constructor(readonly onSimCreated: (sim: Simulation) => void) {
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
      this.simulation = undefined
      this.started = false
      setTimeout(() => this.connect(), this.reconnectInterval)
    }
  }

  private handleEvent(data: string) {
    try {
      const decoded = Uint8Array.from(atob(data), (c) => c.charCodeAt(0));
      const event = Event.fromBinary(decoded)

      if (!this.simulation) {
        if (event.event.oneofKind !== "gameHeader") {
          throw new Error("First event must be the GameHeader.")
        }

        const world = WorldMap.fromPb(event.event.gameHeader.world!)
        this.simulation = new Simulation(world)
        this.onSimCreated(this.simulation)
        return
      }

      this.simulation.addEvent(event)

      if (event.event.oneofKind === "round") {
        if (!this.started) {
          this.started = true
          this.simulation.renderNextRound()
        }
      }

      if (event.event.oneofKind === "gameFooter")
        this.simulation = undefined

    } catch (error) {
      console.error('Failed to handle websocket event:', error)
    }
  }
}
