import { useContext, createContext, useState, SetStateAction, ReactNode } from 'react'
import { Simulation } from '@/core/simulation'

export interface AppContext {
    simulation: Simulation | undefined
    simPaused: boolean
    selectedCell: { x: number; y: number } | null
    editorSimulation: Simulation | undefined // Used for the map editor, so it doesn't have to overwrite the game's simulation
    editorSelectedCell: { x: number; y: number } | null // Independent selection for map editor
}

const DEFAULT_APP_CONTEXT: AppContext = {
    simulation: undefined,
    simPaused: true,
    selectedCell: null,
    editorSimulation: undefined,
    editorSelectedCell: null
}

export interface AppState {
    appState: AppContext
    setAppState: (value: SetStateAction<AppContext>) => void
}

const AppContext = createContext({} as AppState)

interface Props {
    children: ReactNode[] | ReactNode
}

export const AppContextProvider: React.FC<Props> = (props) => {
    const [appState, setAppState] = useState(DEFAULT_APP_CONTEXT)
    return (
        <AppContext.Provider value={{ appState: appState, setAppState: setAppState }}>
            {props.children}
        </AppContext.Provider>
    )
}

export const useAppContext = () => useContext(AppContext)
