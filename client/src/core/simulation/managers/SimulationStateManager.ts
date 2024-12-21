import { SimulationState } from '@/core/simulation'

export class SimulationStateManager {
    private state: SimulationState

    constructor() {
        this.state = {
            currentRound: 0,
            maxRounds: -1,
            isRoundZero: true
        }
    }

    getCurrentRound(): number {
        return this.state.currentRound
    }

    setCurrentRound(round: number): void {
        this.state.currentRound = Math.max(0, Math.min(round, this.state.maxRounds))
    }

    incrementMaxRounds(): void {
        this.state.maxRounds++
    }

    getMaxRounds(): number {
        return this.state.maxRounds
    }

    isGameOver(): boolean {
        return this.state.currentRound >= this.state.maxRounds
    }

    isRoundZero(): boolean {
        return this.state.isRoundZero
    }

    setRoundZero(value: boolean): void {
        this.state.isRoundZero = value
    }
}
