import { useEffect, useState } from "react"
import { Renderer } from "@/core/Renderer"
import { subscribe, ListenerKey } from "@/core/Listeners"
import type { Vector } from "@/types"

export default function useHover(): Vector | undefined {
  const [hovered, setHovered] = useState(Renderer.getHoveredTile())

  useEffect(() => {
    const unsubscribe = subscribe(ListenerKey.Hover, () => {
      setHovered(Renderer.getHoveredTile())
    })

    return unsubscribe
  }, [])

  return hovered
}
