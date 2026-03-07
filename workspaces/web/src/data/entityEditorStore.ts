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
export const [useEntityEditorHistory, updateEntityEditorHistory] = createPersistedStore<{ history: TEntityEditorStore[] }>({
  initialData: {
    history: [],
  },
  localStorageKey: "useEntityEditorHistory_v1",
});

export const openEntityEditor = (data: Omit<TEntityEditorStore, 'key'>, push: boolean = true) => {
  const completeEntity: TEntityEditorStore = {
    ...data,
    key: `${data.dataSourceId}-${data.tableName}-${data.entityId.map((e) => e[0] + e[1]).join('')}`,
  };
  updateCreateEntity(undefined);
  if (push) {
    updateEntityEditorHistory((store) => {
      if (store.history.some((e) => e.key === completeEntity.key)) {
        // already exists
        return store;
      }

      if (store.history.length < 20) {
        return {
          history: [...store.history, completeEntity],
        };
      } else {
        return {
          history: [...store.history.slice(1), completeEntity],
        };
      }
    });
  }
  updateEntityEditor(completeEntity);
};
export const closeEntityEditorModal = () => updateEntityEditor(undefined);
