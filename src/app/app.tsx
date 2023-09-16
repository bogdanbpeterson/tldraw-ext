import {
  type Editor,
  Tldraw /* , type TLUiMenuGroup */,
  type TLUiTranslationKey,
} from "@tldraw/tldraw";
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
        overrides={{
          helpMenu(_editor, schema) {
            // Adds ext store menu item to Help menu
            // Bug: once you click it there's no way back to the app
            if (schema[0] && schema[0].type === "group") {
              schema[0].children.push({
                actionItem: {
                  id: "check-ext-store",
                  label: "Check out EXT website" as TLUiTranslationKey,
                  onSelect() {
                    window.location.replace("https://ext.store");
                  },
                  readonlyOk: true,
                },
                id: "check-ext-store",
                type: "item",
                checked: false,
                disabled: false,
                readonlyOk: false,
              });
            }

            return schema;
          },

          // The dark mode toggler can be removed with overrides, but it's kinda messy.
          // You'd either have to loop a lot or use a weird trick like this one below.
          // Heads up: it's highly dependent on the schema setup and might break on update.

          // menu(_editor, schema) {
          //   (
          //     ((schema[2] as TLUiMenuGroup).children[0] as TLUiMenuGroup)
          //       .children[0] as TLUiMenuGroup
          //   ).children = (
          //     ((schema[2] as TLUiMenuGroup).children[0] as TLUiMenuGroup)
          //       .children[0] as TLUiMenuGroup
          //   ).children.filter((child) => child.id !== "toggle-dark-mode");

          //   return schema;
          // },
        }}
      />
    </div>
  );
}

export default App;
