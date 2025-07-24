import { create } from 'zustand'
import Game from '@/core/Game'
import Games from '@/core/Games'
import { BrushType } from '@/types'

interface AppStore {
  queue: Games[]
  selectedCell: { x: number; y: number } | null
  editorSimulation: Game | undefined
  editorSelectedCell: { x: number; y: number } | null
  currentBrushType: BrushType | null

  setQueue: (queue: Games[]) => void
  pushToQueue: (game: Games) => void
  clearQueue: () => void

  setSelectedCell: (cell: { x: number; y: number } | null) => void
  setEditorSimulation: (game: Game | undefined) => void
  setEditorSelectedCell: (cell: { x: number; y: number } | null) => void
  setBrushType: (brush: BrushType | null) => void
}

export const useAppStore = create<AppStore>((set) => ({
  queue: [],
  selectedCell: null,
  editorSimulation: undefined,
  editorSelectedCell: null,
  currentBrushType: null,

  setQueue: (queue) => set({ queue }),
  pushToQueue: (game) => set((state) => ({ queue: [...state.queue, game] })),
  clearQueue: () => set({ queue: [] }),

  setSelectedCell: (cell) => set({ selectedCell: cell }),
  setEditorSimulation: (game) => set({ editorSimulation: game }),
  setEditorSelectedCell: (cell) => set({ editorSelectedCell: cell }),
  setBrushType: (brush) => set({ currentBrushType: brush }),
}))
