export const tryScrollIntoTab = (tabId: string) => {
  setTimeout((tabId) => {
    const tab = document.querySelector(`[data-tab-id="${tabId}"]`);
    if (tab) {
      tab.scrollIntoView({ behavior: "smooth" });
    }
  }, 50, tabId);
};
