import {createPersistedStore} from "../utils/storeUtils.ts";

export const [useShowQueryInfo, setShowQueryInfo] = createPersistedStore({
  storage: localStorage,
  localStorageKey: "useShowQueryInfo",
  initialData: true,
});
