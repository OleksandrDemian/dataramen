import {createStore} from "@odemian/react-store";
import {TDbValue} from "@dataramen/types";

export type TEntityEditorStore = {
  dataSourceId: string;
  tableName: string;
  entityId: [string, TDbValue][];
  onSuccess?: VoidFunction;
};
export const [useEntityEditor, updateEntityEditor] = createStore<TEntityEditorStore | undefined>(undefined);

export const closeEntityEditorModal = () => updateEntityEditor(undefined);
