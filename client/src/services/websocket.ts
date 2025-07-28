import Game from '@/core/Game'
import Games from '@/core/Games'
import { schema } from 'aegis-schema'

export class ClientWebSocket {
  private url: string = 'ws://localhost:6003'
  private reconnectInterval: number = 500
  private games: Games | undefined = undefined
  private game: Game | undefined = undefined

  constructor(
    readonly onGameCreated: (game: Game) => void,
    readonly onGamesCreated: (games: Games) => void
  ) {
    this.connect()
  }

  private connect() {
    const ws: WebSocket = new WebSocket(this.url)

    ws.onopen = () => {
      console.log(`Connected to ${this.url}`)
    }

    ws.onmessage = (event) => {
      this.handleEvent(event.data)
    }

    ws.onclose = () => {
      this.game = undefined
      setTimeout(() => this.connect(), this.reconnectInterval)
    }
  }

  private handleEvent(data: string) {
    try {
      const decoded = Uint8Array.from(atob(data), (c) => c.charCodeAt(0))
      const event = schema.Event.fromBinary(decoded)

      if (!this.games) {
        if (event.event.oneofKind !== 'gamesHeader') {
          throw new Error('First event must be the GamesHeader.')
        }

        this.games = new Games(true)
        return
      }

      this.games.addEvent(event)

      if (event.event.oneofKind === 'round') {
        const games = this.games.games
        const game = games[games.length - 1]
        if (this.game === game) return

        this.onGameCreated(game)
        this.game = game
      }

      if (event.event.oneofKind === 'gameFooter') this.game = undefined
    } catch (error) {
      console.error('Failed to handle websocket event:', error)
    }
  }
}
