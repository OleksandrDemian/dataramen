import {TTableOptions} from "../widgets/ExplorerView/context/TableContext.ts";
import {createTableOptions} from "../widgets/ExplorerView/utils.ts";
import {createPersistedStore} from "../utils/storeUtils.ts";
import toast from "react-hot-toast";

export type TExplorerTab = {
  label: string;
  id: string;
  type: "explorer";
  options: TTableOptions;
};

export type TOpenTab = TExplorerTab;

export const [useOpenTabs, updateOpenTabs, OpenTabs] = createPersistedStore<TOpenTab[]>({
  initialData: [],
  localStorageKey: "open-tabs__v1",
});
export const [useActiveTab, updateActiveTab, ActiveTab] = createPersistedStore<string>({
  initialData: "",
  localStorageKey: "active-tabs",
  storage: sessionStorage,
});

export const pushNewExplorerTab = (label: string, opts: Partial<TTableOptions>, activate: boolean = false) => {
  tabSizeGuard();

  const newTab = pushNewTab({
    label,
    type: "explorer",
    id: Date.now().toString(36),
    options: createTableOptions(opts),
  });

  if (activate) {
    setActiveTab(newTab.id);
  }
};

export const removeTab = (tabId: string) => {
  const activeTab = ActiveTab.get();
  updateOpenTabs((store) => store.filter((t) => t.id !== tabId));
  if (activeTab === tabId) {
    const allTabs = OpenTabs.get();
    if (allTabs.length > 0) {
      updateActiveTab(allTabs[0].id);
    } else {
      updateActiveTab("");
    }
  }
};

export const setActiveTab = (tabId: string) => {
  updateActiveTab(tabId);
};

export const renameTab = (tabId: string, newLabel: string) => {
  updateOpenTabs((store) => store.map((t) => {
    if (t.id === tabId) {
      return {
        ...t,
        label: newLabel,
      };
    }

    return t;
  }),);
}

function pushNewTab (tab: TOpenTab) {
  updateOpenTabs((store) => store ? [...store, tab] : [tab]);

  return tab;
}

const MAX_TABS = 20;
function tabSizeGuard () {
  const currentTabs = OpenTabs.get();

  if (currentTabs.length >= MAX_TABS) {
    const errorMessage = `Maximum ${MAX_TABS} tabs are allowed to be open at the same time. Please close other tabs to open new ones.`;
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
}
