import { Simulation } from '@/core/simulation'
import { WorldMap } from '@/core/world'
import { ProtobufService } from './protobuf'

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

    private handleEvent(data: any) {
        const decodedBase64 = Uint8Array.from(atob(data), (c) => c.charCodeAt(0))
        const event = this.protobufService.deserialize(decodedBase64)

        if (!this.simulation) {
            // First event should be the world data
            const world = WorldMap.fromData(event.data)
            this.simulation = new Simulation(world)
            this.onSimCreated(this.simulation)
        }
        this.simulation.addEvent(event)

        if (event.event_type === 'SimulationComplete') {
            this.simulation = undefined
        }
    }
}
