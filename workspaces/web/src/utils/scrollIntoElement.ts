import { highlightSelector } from "./highlighter";

export const tryScrollIntoTab = (tabId: string) => {
  setTimeout((tabId: string) => {
    const tab = document.querySelector(`[data-tab-id="${tabId}"]`);
    if (tab) {
      tab.scrollIntoView({ behavior: "smooth" });
    }
  }, 50, tabId);
};

export const tryScrollIntoColumn = (columnName: string) => {
  setTimeout((columnName: string) => {
    const sel = `[data-column-name="${columnName}"]`;
    const column = document.querySelector(sel);
    if (column) {
      column.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
      highlightSelector(sel, 2000, "temp-highlight");
    }
  }, 50, columnName);
};
