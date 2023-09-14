type Instance = {
  tabId: string;
  windowId: string;
};

const instances: (Instance | null)[] = [];

const findFirstEmptySpot = (array: (any | null)[]) => {
  let emptySpotIndex = array.findIndex((item) => item === null);

  if (emptySpotIndex === -1) emptySpotIndex = array.length;

  return emptySpotIndex;
};

ext.runtime.onExtensionClick.addListener(async () => {
  const availableSpot = findFirstEmptySpot(instances);

  const tab = await ext.tabs.create({
    index: availableSpot,
    text: `TLDraw - #${availableSpot + 1}`,
    icon: "./assets/128.png",
    icon_dark: "./assets/128-dark.png",
  });
  const window = await ext.windows.create();
  const windowSize = await ext.windows.getBounds(window.id);
  const websession = await ext.websessions.create({
    partition: `TLDraw - #${availableSpot + 1}`,
    cache: true,
    persistent: true,
    global: false,
  });
  const webview = await ext.webviews.create({
    window,
    websession,
    autoResize: { horizontal: true, vertical: true },
    bounds: {
      x: 0,
      y: 0,
      width: windowSize.width,
      height: windowSize.height,
    },
  });

  await ext.webviews.loadFile(webview.id, "index.html");
  await ext.webviews.openDevTools(webview.id, { mode: "undocked" });
  console.log("is dark", await ext.windows.getPlatformDarkMode());
  const instance: Instance = {
    tabId: tab.id,
    windowId: window.id,
  };

  instances[availableSpot] = instance;
});

ext.tabs.onClicked.addListener(async (event) => {
  const instance = instances.find((instance) => instance?.tabId === event.id);

  if (instance) {
    await ext.windows.restore(instance.windowId);
    await ext.windows.focus(instance.windowId);
  }
});

ext.tabs.onClickedClose.addListener(async (event) => {
  const instanceIndex = instances.findIndex(
    (instance) => instance?.tabId === event.id,
  );
  const instance = instances[instanceIndex];

  if (instance) {
    await ext.windows.remove(instance.windowId);
    await ext.tabs.remove(instance.tabId);
    instances[instanceIndex] = null;
  }
});

ext.windows.onClosed.addListener(async (event) => {
  const instanceIndex = instances.findIndex(
    (instance) => instance?.windowId === event.id,
  );
  const instance = instances[instanceIndex];

  if (instance) {
    await ext.tabs.remove(instance.tabId);
    instances[instanceIndex] = null;
  }
});
