import {createStore} from "@odemian/react-store";

export const [useShowTabsHistory, updateShowTabsHistory] = createStore<{ show: boolean }>({
  show: false,
});
