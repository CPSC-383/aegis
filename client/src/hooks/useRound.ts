import { useEffect, useState } from 'react'
import useGame from './useGame'
import { ListenerKey, subscribe } from '@/core/Listeners'
import type Round from '@/core/Round'

export default function useRound(): Round | undefined {
  const game = useGame()
  const [round, setRound] = useState(game?.currentRound)
  const [_, setRoundNumber] = useState(game?.currentRound.round)

  useEffect(() => {
    const unsubscribe = subscribe(ListenerKey.Round, () => {
      setRound(game?.currentRound)
      setRoundNumber(game?.currentRound?.round)
    })

    return unsubscribe
  }, [game])

  return round
}
