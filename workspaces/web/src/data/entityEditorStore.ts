import {createStore} from "@odemian/react-store";
import {updateCreateEntity} from "./entityCreatorStore.ts";
import {createPersistedStore} from "../utils/storeUtils.ts";

export type TEntityEditorStore = {
  dataSourceId: string;
  tableName: string;
  entityId: [string, string][];
  onSuccess?: VoidFunction;
  key: string;
};
export const [useEntityEditor, updateEntityEditor] = createStore<TEntityEditorStore | undefined>(undefined);
export const [useEntityEditorHistory, updateEntityEditorHistory] = createPersistedStore<TEntityEditorStore[]>({
  initialData: [],
  localStorageKey: "useEntityEditorHistory",
});

export const openEntityEditor = (data: Omit<TEntityEditorStore, 'key'>, push: boolean = true) => {
  const completeEntity: TEntityEditorStore = {
    ...data,
    key: `${data.dataSourceId}-${data.tableName}-${data.entityId.map((e) => e[0] + e[1]).join('')}`,
  };
  updateCreateEntity(undefined);
  if (push) {
    updateEntityEditorHistory((store) => {
      if (store.some((e) => e.key === completeEntity.key)) {
        // already exists
        return store;
      }

      if (store.length < 20) {
        return [...store, completeEntity];
      } else {
        return [...store.slice(1), completeEntity];
      }
    });
  }
  updateEntityEditor(completeEntity);
};
export const closeEntityEditorModal = () => updateEntityEditor(undefined);
