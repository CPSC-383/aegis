import GameArea from './components/Game-area'
import ControlsBar from './components/controls-bar/Controls-bar'
import Sidebar from './components/sidebar/Sidebar'
import useGames from './hooks/useGames'

function App() {
  const games = useGames()
  return (
    <div className="flex bg-background overflow-hidden">
      <div className="flex w-full h-screen justify-center">
        <GameArea />
        {games?.playable && <ControlsBar />}
      </div>
      <Sidebar />
    </div>
  )
}

export default App
