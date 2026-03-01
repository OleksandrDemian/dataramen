import {createStore} from "@odemian/react-store";
import {updateEntityEditor} from "./entityEditorStore.ts";

export type TEntityCreatorStore = {
  dataSourceId: string;
  table: string;
};
export const [useCreateEntity, updateCreateEntity] = createStore<TEntityCreatorStore | undefined>(undefined);

export const openEntityCreatorSidebar = (data: TEntityCreatorStore) => {
  updateEntityEditor(undefined);
  updateCreateEntity(data);
};
export const closeEntityCreatorModal = () => updateCreateEntity(undefined);
