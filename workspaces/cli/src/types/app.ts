import {TCommand, TModule} from "./commands";

export type TMetadata = {
  name: string;
  description: string;
  version: string;
};

export type TApp <T = unknown> = {
  id: string;
  setMetadata: (metadata: TMetadata) => TApp<T>;
  setDefaultCommand: (defaultCommand?: TCommand) => TApp<T>;
  setModules: (modules: TModule[]) => TApp<T>;
  start: () => TApp<T>;
  getHandler: () => T;
};
