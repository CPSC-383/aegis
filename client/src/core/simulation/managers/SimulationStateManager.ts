import { SimulationState } from '@/core/simulation'

export class SimulationStateManager {
    private state: SimulationState

    constructor() {
        this.state = {
            currentRound: 0,
            maxRounds: 0,
            isRoundZero: true
        }
    }

    getCurrentRound(): number {
        return this.state.currentRound
    }

    setCurrentRound(round: number): void {
        // Ensure round is within valid bounds: 0 to maxRounds
        this.state.currentRound = Math.max(0, Math.min(round, this.state.maxRounds))
    }

    getMaxRounds(): number {
        return this.state.maxRounds
    }

    incrementMaxRounds(): void {
        this.state.maxRounds++
    }

    isRoundZero(): boolean {
        return this.state.isRoundZero
    }

    setRoundZero(isRoundZero: boolean): void {
        this.state.isRoundZero = isRoundZero
    }

    isGameOver(): boolean {
        return this.state.currentRound >= this.state.maxRounds
    }
}
