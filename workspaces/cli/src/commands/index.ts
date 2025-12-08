import {TCommand} from "../types/commands";
import start from "./start";
import logs from "./logs";
import stop from "./stop";
import open from "./open";
import set from "./set";
import unset from "./unset";

export const commandsList: TCommand[] = [
  start,
  logs,
  stop,
  open,
  set,
  unset,
];
