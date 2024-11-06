import clsx from "clsx";
import Home from "./pages/Home";

function App() {
  const isStandalone = (window.navigator as { standalone?: boolean })
    .standalone; // only for iOS
  return (
    <div className={clsx("wrapper", { standalone: isStandalone })}>
      <Home />
    </div>
  );
}

export default App;
