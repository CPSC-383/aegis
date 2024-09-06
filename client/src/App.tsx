import { AppContextProvider } from './context'
import MainPage from './main-page'

function App() {
    return (
        <AppContextProvider>
            <MainPage />
        </AppContextProvider>
    )
}

export default App
