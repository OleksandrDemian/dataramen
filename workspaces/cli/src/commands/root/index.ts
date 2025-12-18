import {TModule} from "../../types/commands";
import start from "./start";
import logs from "./logs";
import stop from "./stop";
import open from "./open";

export const rootModule: TModule = {
  name: "root",
  description: "Root module has no description",
  commands: [
    start,
    logs,
    stop,
    open,
  ],
};
