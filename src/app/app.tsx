import { Tldraw } from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";

function App() {
  console.log("body size", document.body.getBoundingClientRect());
  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <Tldraw persistenceKey={"tldraw-key"} />
    </div>
  );
}

export default App;
