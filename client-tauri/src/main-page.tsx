import GameArea from "./components/GameArea";
import ControlsBar from "./components/controls-bar/ControlsBar";
import Sidebar from "./components/sidebar/Sidebar";

function MainPage() {
  return (
    <div className="flex bg-background overflow-hidden">
      <div className="flex w-full h-screen justify-center">
        <GameArea />
        <ControlsBar />
      </div>
      <Sidebar />
    </div>
  );
}

export default MainPage;
