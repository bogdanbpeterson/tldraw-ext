import { Tldraw } from "@tldraw/tldraw";
import { getAssetUrls } from "@tldraw/assets/selfHosted";
import "@tldraw/tldraw/tldraw.css";

function App() {
  return (
    <div className="tldraw">
      <Tldraw
        persistenceKey={"tldraw-key"}
        assetUrls={getAssetUrls((url) => url)}
      />
    </div>
  );
}

export default App;
