import GameArea from './components/Game-area'
import ControlsBar from './components/controls-bar/Controls-bar'
import Sidebar from './components/sidebar/Sidebar'

function App() {
  return (
    <div className="flex bg-background overflow-hidden">
      <div className="flex w-full h-screen justify-center">
        <GameArea />
        <ControlsBar />
      </div>
      <Sidebar />
    </div>
  )
}

export default App
