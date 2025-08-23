import {createStore} from "@odemian/react-store";

export type TEntityCreatorStore = {
  dataSourceId: string;
  table: string;
};
export const [useCreateEntity, updateCreateEntity] = createStore<TEntityCreatorStore | undefined>(undefined);

export const closeEntityCreatorModal = () => updateCreateEntity(undefined);
