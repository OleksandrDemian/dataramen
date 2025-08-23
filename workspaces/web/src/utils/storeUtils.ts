import {createStore} from "@odemian/react-store";

function restore <T>(key: string, def: T, storage: Storage): T {
  try {
    const value = storage.getItem(key);
    if(value) {
      return JSON.parse(value);
    }
  } catch (e: unknown) {
    console.warn("Failed to restore tabs", e);
  }

  return def;
}

export type TCreatePersistedStoreProps <T> = {
  initialData: T;
  localStorageKey: string;
  storage?: Storage;
};
export const createPersistedStore = <T>({ storage = localStorage, localStorageKey, initialData }: TCreatePersistedStoreProps<T>) => {
  const store = createStore<T>(restore(localStorageKey, initialData, storage));

  store[2].subscribe((store) => {
    storage.setItem(localStorageKey, JSON.stringify(store));
  });

  return store;
}