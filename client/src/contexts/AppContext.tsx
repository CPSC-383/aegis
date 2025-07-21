import { Game } from '@/core/game'
import { BrushType } from '@/types'
import { createContext, ReactNode, SetStateAction, useContext, useState } from 'react'

export interface AppContext {
  simulation: Game | undefined
  simPaused: boolean
  selectedCell: { x: number; y: number } | null
  editorSimulation: Game | undefined // Used for the map editor, so it doesn't have to overwrite the game's simulation
  editorSelectedCell: { x: number; y: number } | null // Independent selection for map editor
  currentBrushType: BrushType | null // Current brush type for editor mode
}

const DEFAULT_APP_CONTEXT: AppContext = {
  simulation: undefined,
  simPaused: true,
  selectedCell: null,
  editorSimulation: undefined,
  editorSelectedCell: null,
  currentBrushType: null
}

export interface AppState {
  appState: AppContext
  setAppState: (value: SetStateAction<AppContext>) => void
}

const AppContext = createContext({} as AppState)

interface Props {
  children: ReactNode
}

export const AppContextProvider = ({ children }: Props): JSX.Element => {
  const [appState, setAppState] = useState(DEFAULT_APP_CONTEXT)
  return (
    <AppContext.Provider value={{ appState: appState, setAppState: setAppState }}>
      {children}
    </AppContext.Provider>
  )
}

export const useAppContext = (): AppState => useContext(AppContext)
