import Games from "@/core/Games"
import { create } from "zustand"

interface AppState {
  queue: Games[]
  editorGames: Games | null
  collapsedPanels: Record<string, boolean>

  setQueue: (queue: Games[]) => void
  pushToQueue: (game: Games) => void
  clearQueue: () => void

  setEditorGames: (games: Games | null) => void
  togglePanel: (panelId: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  queue: [],
  editorGames: null,
  collapsedPanels: {},

  setQueue: (queue): void => set({ queue }),
  pushToQueue: (game): void => set((state) => ({ queue: [...state.queue, game] })),
  clearQueue: (): void => set({ queue: [] }),

  setEditorGames: (games): void => set({ editorGames: games }),
  togglePanel: (panelId: string): void =>
    set((state) => ({
      ...state,
      collapsedPanels: {
        ...state.collapsedPanels,
        [panelId]: !state.collapsedPanels[panelId],
      },
    })),
}))
