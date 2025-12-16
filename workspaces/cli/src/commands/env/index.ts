import set from "./set";
import unset from "./unset";
import list from "./list";
import {TModule} from "../../types/commands";

export const envModule: TModule = {
  name: "env",
  description: "Handle env variables",
  commands: [set, unset, list],
};
