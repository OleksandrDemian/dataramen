import {createStore} from "@odemian/react-store";

export type TEntityEditorStore = {
  dataSourceId: string;
  tableName: string;
  entityId: [string, string][];
  onSuccess?: VoidFunction;
};
export const [useEntityEditor, updateEntityEditor] = createStore<TEntityEditorStore | undefined>(undefined);

export const closeEntityEditorModal = () => updateEntityEditor(undefined);
