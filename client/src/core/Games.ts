import { schema } from "aegis-schema";
import Game from "./Game";

let nextId = 0

export default class Games {
  public readonly games: Game[] = []
  public currentGame: Game | undefined = undefined
  public readonly id: number

  constructor() {
    this.id = nextId++
  }

  /**
   * Adds a new event.
   * @param {Event} event - The event wrapper.
   */
  addEvent(event: schema.Event): void {
    switch (event.event.oneofKind) {
      case "gamesHeader":
        throw new Error("Cannot add another GamesHeader event.")
      case "gameHeader":
        const header = event.event.gameHeader
        const game = Game.fromSchema(this, header)
        this.games.push(game)
        this.currentGame = game
        game.initEnergy()
        return
      case "round":
        if (this.currentGame === undefined) {
          throw new Error("Cannot add rounds to an undefined game.")
        }
        const round = event.event.round
        this.currentGame.addRound(round)
        return
      case "gameFooter":
        return
      case "gamesFooter":
        return
    }
  }
}
