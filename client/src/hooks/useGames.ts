import { useEffect, useState } from 'react'
import { Runner } from '@/core/Runner'
import { ListenerKey, subscribe } from '@/core/Listeners'
import Games from '@/core/Games'

export default function useGame(): Games | undefined {
  const [games, setGames] = useState(Runner.games)

  useEffect(() => {
    const unsubscribe = subscribe(ListenerKey.Game, () => setGames(Runner.games))
    return unsubscribe
  }, [])

  return games
}
