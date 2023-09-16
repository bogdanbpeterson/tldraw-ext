import { type Editor, Tldraw } from "@tldraw/tldraw";
import { getAssetUrls } from "@tldraw/assets/selfHosted";
import "@tldraw/tldraw/tldraw.css";
import { useEffect, useRef } from "react";

function App() {
  const editorRef = useRef<Editor>();

  useEffect(() => {
    const themeChangeHandler = (
      _event: ext.windows.WindowEvent,
      details: ext.windows.EventDarkMode,
    ) => {
      if (!editorRef.current) return;

      editorRef.current.setDarkMode(details.enabled && details.platform);
    };

    ext.windows.onUpdatedDarkMode.addListener(themeChangeHandler);

    return () => {
      ext.windows.onUpdatedDarkMode.removeListener(themeChangeHandler);
    };
  }, [editorRef.current]);

  const handleMount = (editor: Editor) => {
    editorRef.current = editor;

    ext.windows.getPlatformDarkMode().then((darkMode) => {
      editor.setDarkMode(darkMode);
    });
  };

  return (
    <div className="tldraw">
      <Tldraw
        persistenceKey={"tldraw-key"}
        assetUrls={getAssetUrls((url) => url)}
        onMount={handleMount}
      />
    </div>
  );
}

export default App;
