import { Tldraw } from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";

function App() {
  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <Tldraw persistenceKey={(window as any).tldrawPersistenceKey} />
    </div>
  );
}

export default App;
