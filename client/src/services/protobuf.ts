import protobuf from 'protobufjs'

export class ProtobufService {
    private static instance: ProtobufService
    private root: protobuf.Root | null = null
    private SimulationEvent: protobuf.Type | null = null

    private constructor() {}

    static getInstance(): ProtobufService {
        if (!ProtobufService.instance) {
            ProtobufService.instance = new ProtobufService()
        }
        return ProtobufService.instance
    }

    async initialize(): Promise<void> {
        if (this.root) return // Already initialized

        try {
            // Load the .proto file from the client's protobuf directory
            this.root = await protobuf.load('src/protobuf/aegis.proto')
            this.SimulationEvent = this.root.lookupType('aegis.SimulationEvent')

            if (!this.SimulationEvent) {
                throw new Error('Could not find SimulationEvent type in proto file')
            }

            console.log('Protobuf service initialized successfully')
        } catch (error) {
            console.error('Failed to initialize protobuf service:', error)
            throw error
        }
    }

    deserialize(buffer: Uint8Array): any {
        if (!this.SimulationEvent) {
            throw new Error('Protobuf service not initialized')
        }

        try {
            // Decode the buffer
            const message = this.SimulationEvent.decode(buffer)
            // Convert to plain object
            return this.SimulationEvent.toObject(message, {
                longs: String,
                enums: String,
                bytes: String
            })
        } catch (error) {
            console.error('Failed to deserialize protobuf message:', error)
            throw error
        }
    }
}
