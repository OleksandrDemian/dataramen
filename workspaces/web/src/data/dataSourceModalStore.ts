import {createStore} from "@odemian/react-store";

export const [useDataSourceModal, setDataSourceModal] = createStore<string | undefined>(undefined);
