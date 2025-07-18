import { Simulation } from '@/core/simulation'
import { WorldMap } from '@/core/world'
import { ProtobufService } from './protobuf'
import { SimulationEvent, WorldState, RoundUpdate } from '@/generated/aegis'

export class ClientWebSocket {
  private url: string = 'ws://localhost:6003'
  private reconnectInterval: number = 500
  private simulation: Simulation | undefined = undefined
  private protobufService: ProtobufService

  constructor(readonly onSimCreated: (sim: Simulation) => void) {
    this.protobufService = ProtobufService.getInstance()
    this.initializeProtobuf()
    this.connect()
  }

  private async initializeProtobuf() {
    try {
      await this.protobufService.initialize()
    } catch (error) {
      console.error('Failed to initialize protobuf service:', error)
    }
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
      setTimeout(() => {
        this.connect()
      }, this.reconnectInterval)
    }
  }

  private handleEvent(data: string) {
    try {
      const decodedBase64 = Uint8Array.from(atob(data), (c) => c.charCodeAt(0))
      const event: SimulationEvent = this.protobufService.deserialize(decodedBase64)

      if (!this.simulation) {
        // First event should be the world init data
        if (event.event.oneofKind === 'worldInit') {
          const world = WorldMap.fromProtobufWorldState(event.event.worldInit)
          this.simulation = new Simulation(world)
          this.onSimCreated(this.simulation)
        }
      } else {
        // Handle round updates and completion
        if (event.event.oneofKind === 'roundUpdate') {
          this.simulation.addProtobufEvent(event.event.roundUpdate)
        } else if (event.event.oneofKind === 'complete') {
          this.simulation = undefined
        }
      }
    } catch (error) {
      console.error('Failed to handle websocket event:', error)
    }
  }
}
