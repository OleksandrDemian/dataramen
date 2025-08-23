import {createStore} from "@odemian/react-store";
import {TColumnDescription} from "./types/dataSources.ts";

export const [useAutocompleteTables, updateAutocompleteTables, AutocompleteTables] = createStore<Record<string, TColumnDescription[]>>({});
