import { SimulationEvent } from '@/generated/aegis'
import { BinaryReader, binaryReadOptions } from '@protobuf-ts/runtime'

export class ProtobufService {
    private static instance: ProtobufService

    private constructor() {}

    static getInstance(): ProtobufService {
        if (!ProtobufService.instance) {
            ProtobufService.instance = new ProtobufService()
        }
        return ProtobufService.instance
    }

    async initialize(): Promise<void> {
        // No initialization needed with protobuf-ts generated types
        console.log('Protobuf service initialized successfully')
    }

    deserialize(buffer: Uint8Array): SimulationEvent {
        try {
            // Create a BinaryReader from the buffer
            const reader = new BinaryReader(buffer)
            // Decode the buffer using the generated protobuf-ts type
            return SimulationEvent.internalBinaryRead(
                reader,
                buffer.length,
                binaryReadOptions(),
                SimulationEvent.create()
            )
        } catch (error) {
            console.error('Failed to deserialize protobuf message:', error)
            throw error
        }
    }
}
