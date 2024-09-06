import GameArea from './components/Game-area'
import ControlsBar from './components/controls-bar/Controls-bar'
import RightSidebar from './components/sidebar/Sidebar'

function MainPage() {
    return (
        <div className="flex bg-background overflow-hidden">
            <div className="flex w-full h-screen justify-center">
                <GameArea />
                <ControlsBar />
            </div>
            <RightSidebar />
        </div>
    )
}

export default MainPage
