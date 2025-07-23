import Agents from './Agents'
import Game from './Game'
import { schema } from 'aegis-schema'
import World from './World'

export default class Round {
  public turn: number = 0

  constructor(
    public readonly game: Game,
    public world: World,
    public round: number,
    public agents: Agents,
    private currentRound: schema.Round | null = null
  ) { }

  public startRound(round: schema.Round | null): void {
    this.agents.processRound(this.currentRound)

    this.round += 1

    this.world.applyRound(round)

    this.turn = 0
    this.currentRound = round
  }

  public jumpToTurn(turn: number): void {
    if (!this.currentRound) return

    while (this.turn < turn) this.stepTurn()
  }

  private stepTurn(): void {
    const turn = this.currentRound!.turns[this.turn]
    if (!turn) return

    this.agents.applyTurn(turn)
    this.turn += 1
  }

  get turnsLength(): number {
    return this.currentRound?.turns.length ?? 0
  }

  public copy(): Round {
    return new Round(
      this.game,
      this.world.copy(),
      this.round,
      this.agents.copy(),
      this.currentRound
    )
  }

  public isEnd(): boolean {
    return this.round === this.game.maxRound
  }
}
