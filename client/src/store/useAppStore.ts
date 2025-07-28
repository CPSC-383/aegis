import { create } from 'zustand'
import Games from '@/core/Games'

interface AppStore {
  queue: Games[]

  setQueue: (queue: Games[]) => void
  pushToQueue: (game: Games) => void
  clearQueue: () => void
}

export const useAppStore = create<AppStore>((set) => ({
  queue: [],

  setQueue: (queue) => set({ queue }),
  pushToQueue: (game) => set((state) => ({ queue: [...state.queue, game] })),
  clearQueue: () => set({ queue: [] })
}))
