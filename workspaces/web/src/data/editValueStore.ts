import {createStore} from "@odemian/react-store";
import {TDbValue} from "@dataramen/types";

export type EditValueStore = {
  entityId: any;
  entity: string;
  prop: string;
  current: TDbValue;
  dataSourceId: string;
};
export const [useEditValueStore, updateEditValueStore] = createStore<EditValueStore | undefined>(undefined);

export const showEditValueModal = updateEditValueStore;

export const closeEditValueModal = () => {
  updateEditValueStore(undefined);
};
