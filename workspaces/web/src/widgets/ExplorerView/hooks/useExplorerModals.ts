import {createStore} from "@odemian/react-store";

type TModals = "filters" | "joins" | "columns" | "groupBy" | "aggregate";
export const [useExplorerModals, setExplorerModals] = createStore<{ [key in TModals]: boolean }>({
  filters: false,
  joins: false,
  columns: false,
  groupBy: false,
  aggregate: false,
});

export const showExplorerModal = (modal: TModals) => setExplorerModals((store) => ({
  ...store,
  [modal]: true,
}));

export const hideExplorerModal = (modal: TModals) => setExplorerModals((store) => ({
  ...store,
  [modal]: false,
}));

export const toggleExplorerModal = (modal: TModals) => setExplorerModals((store) => ({
  ...store,
  [modal]: !store[modal],
}));
