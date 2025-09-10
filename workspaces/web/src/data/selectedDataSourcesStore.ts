import {createPersistedStore} from "../utils/storeUtils.ts";

export const [useSelectedDataSources, setSelectedDataSources] = createPersistedStore<string[]>({
  initialData: [],
  localStorageKey: "selected-data-sources-v1"
});

export const toggleSelectedDataSource = (dsId: string) => setSelectedDataSources(
  (store) => {
    const findIndex = store.indexOf(dsId);
    if (findIndex > -1) {
      store.splice(findIndex, 1)
      return [...store];
    }

    return [...store, dsId];
  }
);
