import { useEffect, useState } from 'react'
import { Runner } from '@/core/Runner'
import { ListenerKey, subscribe } from '@/core/Listeners'
import Game from '@/core/Game'

export default function useGame(): Game | undefined {
  const [game, setGame] = useState(Runner.game)

  useEffect(() => {
    const unsubscribe = subscribe(ListenerKey.Game, () => setGame(Runner.game))
    return unsubscribe
  }, [])

  return game
}
