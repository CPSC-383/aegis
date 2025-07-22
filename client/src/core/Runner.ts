import Game from "./Game";
import Games from "./Games";
import { Renderer } from "./Renderer";
import { ListenerKey, notify } from "./Listeners";
import { ROUND_INTERVAL_DURATION } from "@/utils/constants";

class RunnerClass {
  private gameLoop: NodeJS.Timeout | undefined = undefined
  games: Games | undefined = undefined
  paused: boolean = true

  get game(): Game | undefined {
    return this.games?.currentGame
  }

  private startGameLoop(): void {
    if (this.gameLoop) return

    this.gameLoop = setInterval(() => {
      if (!this.game || this.paused) {
        this.stopGameLoop()
        return

      }
      const [roundChanged, turnChanged] = this.game.stepGame()
      Renderer.render()
      if (roundChanged) notify(ListenerKey.Round)
      if (this.game.currentRound.isEnd()) this.setPaused(true)
    }, ROUND_INTERVAL_DURATION)
  }

  private stopGameLoop(): void {
    if (!this.gameLoop) return
    clearInterval(this.gameLoop)
    this.gameLoop = undefined
  }

  private updateGameLoop(): void {
    if (!this.game || this.paused) {
      this.stopGameLoop()
      return
    }
    this.startGameLoop()
  }

  public setPaused(paused: boolean): void {
    if (!this.game) return
    this.paused = paused
    this.updateGameLoop()
    notify(ListenerKey.Control)
  }

  public setGames(games: Games): void {
    if (this.games === games) return
    this.games = games
  }

  public setGame(game: Game | null): void {
    notify(ListenerKey.Match)
    if (game) {
      game.games.currentGame = game
      this.setGames(game.games)
      game.jumpToRound(1)
      Renderer.render()
    }
    this.setPaused(true)
    Renderer.onGameChange()
  }

  public stepRound(step: number): void {
    if (!this.game) return
    this.game.stepRound(step)
    Renderer.render()
    notify(ListenerKey.Round)
  }

  public jumpToRound(round: number): void {
    if (!this.game || this.game.currentRound.round === round) return
    this.game.jumpToRound(round)
    Renderer.render()
    notify(ListenerKey.Round)
  }
}

export const Runner = new RunnerClass()
