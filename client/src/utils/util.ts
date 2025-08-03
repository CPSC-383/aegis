import { useCallback, useState } from "react"
import { Size, Vector } from "@/types"

// Forces a re-render
export function useForceUpdate(): () => void {
  const [, updateState] = useState({})
  return useCallback(() => updateState({}), [])
}

// Image utils
const imageCache = new Map<string, Promise<HTMLImageElement>>()
const loadedImages = new Map<string, HTMLImageElement>()

export function loadImage(path: string): Promise<HTMLImageElement> {
  if (imageCache.has(path)) {
    return imageCache.get(path)!
  }

  const img = new Image()
  img.src = path

  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    img.onload = (): void => {
      loadedImages.set(path, img)
      resolve(img)
    }
    img.onerror = (error): void => {
      reject(error)
    }
  })
  imageCache.set(path, promise)
  return promise
}

export function getImage(path: string): HTMLImageElement | undefined {
  if (loadedImages.has(path)) {
    return loadedImages.get(path)
  }
  loadImage(path)
  return undefined
}

// Format display of types
export function formatDisplayText(text: string): string {
  const stringText = String(text)
  const words = stringText.replace(/_/g, " ").split(" ")
  const formattedWords = words.map(
    (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  )
  return formattedWords.join(" ")
}

// Assignment stuff
export const ASSIGNMENT_A1 = "a1"
export const ASSIGNMENT_A3 = "a3"

export const getCurrentAssignment = (): string => {
  // @ts-ignore: module
  return import.meta.env.VITE_CURRENT_ASSIGNMENT || ASSIGNMENT_A3 // Default to 'a3' if not set
}

// Canvas 0, 0 is the top-left so we need to flip the y coord
export const renderCoords = (x: number, y: number, size: Size): Vector => {
  return { x, y: size.height - y - 1 }
}
