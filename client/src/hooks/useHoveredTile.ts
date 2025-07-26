import { useEffect, useState } from "react"
import { Renderer } from "@/core/Renderer"
import { subscribe, ListenerKey } from "@/core/Listeners"
import type { Vector } from "@/types"

export default function useHoveredTile(): Vector | undefined {
  const [hovered, setHovered] = useState(Renderer.getMouseTile())

  useEffect(() => {
    const unsubscribe = subscribe(ListenerKey.Canvas, () => {
      setHovered(Renderer.getMouseTile())
    })

    return unsubscribe
  }, [])

  return hovered
}
