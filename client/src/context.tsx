import { useContext, createContext, useState, SetStateAction, ReactNode } from 'react'
import { Simulation } from './simulation/simulation'

export interface AppContext {
    simulation: Simulation | undefined
    simPaused: boolean
    selectedCell: { x: number; y: number } | null
}

const DEFAULT_APP_CONTEXT: AppContext = {
    simulation: undefined,
    simPaused: true,
    selectedCell: null
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
