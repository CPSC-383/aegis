import { create } from "zustand"
import Games from "@/core/Games"

interface AppStore {
  queue: Games[]
  editorGames: Games | null

  setQueue: (queue: Games[]) => void
  pushToQueue: (game: Games) => void
  clearQueue: () => void

  setEditorGames: (games: Games | null) => void
}

export const useAppStore = create<AppStore>((set) => ({
  queue: [],
  editorGames: null,

  setQueue: (queue): void => set({ queue }),
  pushToQueue: (game): void => set((state) => ({ queue: [...state.queue, game] })),
  clearQueue: (): void => set({ queue: [] }),

  setEditorGames: (games): void => set({ editorGames: games }),
}))
