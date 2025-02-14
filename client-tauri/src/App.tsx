import "./App.css";
import { AppContextProvider } from "@/contexts/AppContext";
import MainPage from "@/main-page";

function App() {
  // Disable right click menu in prod
  if (!import.meta.env.DEV) {
    document.oncontextmenu = (event) => {
      event.preventDefault();
    };
  }

  return (
    <AppContextProvider>
      <MainPage />
    </AppContextProvider>
  );
}

export default App;
