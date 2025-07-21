import { Game } from "./Game";

export default class Round {
  constructor(
    public readonly game: Game,
    public round: number
  ) { }

  public isEnd(): boolean {
    return this.round === this.game.maxRound
  }
}
