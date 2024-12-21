import { Simulation } from '@/core/simulation'
import { WorldMap } from '@/core/world'
import pako from 'pako'

export class ClientWebSocket {
    private url: string = 'ws://localhost:6003'
    private reconnectInterval: number = 500
    private simulation: Simulation | undefined = undefined

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
            setTimeout(() => {
                this.connect()
            }, this.reconnectInterval)
        }
    }

    private handleEvent(data: any) {
        const decodedBase64 = Uint8Array.from(atob(data), (c) => c.charCodeAt(0))
        const decompressedData = pako.inflate(decodedBase64, { to: 'string' })
        const event = JSON.parse(decompressedData)

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
