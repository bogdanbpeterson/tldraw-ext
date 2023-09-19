type Instance = {
  tabId: string;
  windowId: string;
  webviewId: string;
  websessionId: string;
};

const findFirstEmptySpot = (array: (any | null)[]) => {
  let emptySpotIndex = array.findIndex((item) => item === null);

  if (emptySpotIndex === -1) emptySpotIndex = array.length;

  return emptySpotIndex;
};

class InstancesManager {
  private instances: (Instance | null)[] = [];

  private creationLocked = false;

  private findInstance({ tabId, windowId }: Partial<Instance>) {
    const instanceIndex = this.instances.findIndex(
      (instance) =>
        (tabId && instance?.tabId === tabId) ||
        (windowId && instance?.windowId === windowId),
    );
    const instance = this.instances[instanceIndex];

    return { instance, instanceIndex };
  }

  async create() {
    // Prevents creating duplicating instances
    if (this.creationLocked) return;

    this.creationLocked = true;

    const availableSpot = findFirstEmptySpot(this.instances);
    const tab = await ext.tabs.create({
      index: availableSpot,
      text: `TLDraw - #${availableSpot + 1}`,
      icon: "./assets/128.png",
      icon_dark: "./assets/128-dark.png",
    });
    const window = await ext.windows.create({
      center: true,
      darkMode: "platform",
      fullscreenable: true,
      title: `TLDraw - #${availableSpot + 1}`,
      icon: "./assets/128.png",
      vibrancy: false,
    });
    const contentSize = await ext.windows.getContentSize(window.id);
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
      bounds: { ...contentSize, x: 0, y: 0 },
    });

    await ext.webviews.loadFile(webview.id, "index.html");

    const instance: Instance = {
      tabId: tab.id,
      windowId: window.id,
      websessionId: websession.id,
      webviewId: webview.id,
    };

    this.instances[availableSpot] = instance;

    this.creationLocked = false;
  }

  async destroy({ tabId, windowId }: { tabId?: string; windowId?: string }) {
    const { instance, instanceIndex } = this.findInstance({ tabId, windowId });

    if (instance) {
      await ext.windows.remove(instance.windowId);
      await ext.tabs.remove(instance.tabId);
      await ext.webviews.remove(instance.webviewId);
      await ext.websessions.remove(instance.websessionId);
      this.instances[instanceIndex] = null;
    }
  }

  async focusWindow({ tabId }: { tabId: string }) {
    const { instance } = this.findInstance({ tabId });

    if (instance) {
      await ext.windows.restore(instance.windowId);
      await ext.windows.focus(instance.windowId);
    }
  }
}

const instanceManager = new InstancesManager();

ext.runtime.onExtensionClick.addListener(async () => {
  await instanceManager.create();
});

ext.tabs.onClicked.addListener(async (event) => {
  await instanceManager.focusWindow({ tabId: event.id });
});

ext.tabs.onClickedClose.addListener(async (event) => {
  await instanceManager.destroy({ tabId: event.id });
});

ext.windows.onClosed.addListener(async (event) => {
  await instanceManager.destroy({ windowId: event.id });
});
