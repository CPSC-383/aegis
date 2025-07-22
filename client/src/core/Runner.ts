import Game from "./Game";
import Games from "./Games";
import { Renderer } from "./Renderer";
import { ListenerKey, notify } from "./Listeners";

class RunnerClass {
  games: Games | undefined = undefined

  get game(): Game | undefined {
    return this.games?.currentGame
  }

  public setGames(games: Games) {
    if (this.games === games) return
    this.games = games
  }

  public setGame(game: Game | null) {
    notify(ListenerKey.Match)
    if (game) {
      game.games.currentGame = game
      this.setGames(game.games)
      game.jumpToRound(1)
      Renderer.render()
    }
    Renderer.onGameChange()
  }
}

export const Runner = new RunnerClass()
