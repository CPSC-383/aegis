import { SimulationState } from '@/core/simulation'

export class SimulationStateManager {
    private state: SimulationState

    /**
     * Initializes the simulation state with default values.
     */
    constructor() {
        this.state = {
            currentRound: 0,
            maxRounds: -1,
            isRoundZero: true
        }
    }

    /**
     * Retrieves the current round number.
     * @returns {number} The current round number.
     */
    getCurrentRound(): number {
        return this.state.currentRound
    }

    /**
     * Sets the current round number, ensuring it stays within valid bounds.
     * @param {number} round - The new round number.
     */
    setCurrentRound(round: number): void {
        this.state.currentRound = Math.max(0, Math.min(round, this.state.maxRounds))
    }

    /**
     * Increments the maximum number of rounds by 1.
     */
    incrementMaxRounds(): void {
        this.state.maxRounds++
    }

    /**
     * Retrieves the maximum number of rounds.
     * @returns {number} The maximum number of rounds.
     */
    getMaxRounds(): number {
        return this.state.maxRounds
    }

    /**
     * Determines whether the simulation has ended.
     * @returns {boolean} True if the simulation is over, false otherwise.
     */
    isGameOver(): boolean {
        return this.state.currentRound >= this.state.maxRounds
    }

    /**
     * Checks if the simulation is in the initial round-zero state.
     * @returns {boolean} True if the simulation is in round-zero, false otherwise.
     */
    isRoundZero(): boolean {
        return this.state.isRoundZero
    }

    /**
     * Updates the round-zero status of the simulation.
     * @param {boolean} value - The new round-zero status.
     */
    setRoundZero(value: boolean): void {
        this.state.isRoundZero = value
    }
}
