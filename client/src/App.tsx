import { AppContextProvider } from '@/contexts/AppContext'
import MainPage from '@/main-page'

function App() {
  return (
    <AppContextProvider>
      <MainPage />
    </AppContextProvider>
  )
}

export default App
