import {createStore} from "@odemian/react-store";

export const [useShowSavedQueries, updateShowSavedQueries] = createStore<{ show: boolean }>({
  show: false,
});

export const [useShowTabsHistory, updateShowTabsHistory] = createStore<{ show: boolean }>({
  show: false,
});

export const [useDataSourceModal, setDataSourceModal] = createStore<string | undefined>(undefined);
