import {TCommand, TModule} from "../types/commands";
import {rootModule} from "./root";
import {envModule} from "./env";
import start from "./root/start";

export const commandModules: TModule[] = [
  rootModule,
  envModule,
];

export const defaultCommand: TCommand = start;
