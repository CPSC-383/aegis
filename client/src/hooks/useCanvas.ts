import { useEffect, useState } from 'react'
import { ListenerKey, subscribe } from '@/core/Listeners'
import { Renderer } from '@/core/Renderer'
import { Vector } from '@/types'

interface Return {
  rightClick: boolean
  selectedTile: Vector | undefined
  mouseDown: boolean
}

export default function useCanvas(): Return {
  const [rightClick, setRightClick] = useState(Renderer.getMouseDownRight())
  const [selectedTile, setSelectedTile] = useState(Renderer.getSelectedTile())
  const [mouseDown, setMouseDown] = useState(Renderer.getMouseDownClick())

  useEffect(() => {
    const unsubscribe = subscribe(ListenerKey.Canvas, () => {
      setRightClick(Renderer.getMouseDownRight())
      setSelectedTile(Renderer.getSelectedTile())
      setMouseDown(Renderer.getMouseDownClick())
    })

    return unsubscribe
  }, [])

  return { rightClick, selectedTile, mouseDown }
}
