import {createStore} from "@odemian/react-store";
import {updateCreateEntity} from "./entityCreatorStore.ts";

export type TEntityEditorStore = {
  dataSourceId: string;
  tableName: string;
  entityId: [string, string][];
  onSuccess?: VoidFunction;
};
export const [useEntityEditor, updateEntityEditor] = createStore<TEntityEditorStore | undefined>(undefined);

export const openEntityEditor = (data: TEntityEditorStore) => {
  updateCreateEntity(undefined);
  updateEntityEditor(data);
};
export const closeEntityEditorModal = () => updateEntityEditor(undefined);
