import {Args} from "../utils/argsParser";

export type TModeConfig = {
  bindServerUrl: string;
  skipAuth: boolean;
  name: string;
};

export enum EModeName {
  cli = "cli",
  default = "default",
  docker = "docker",
  dev = "dev",
}

const modeConfigs: Record<EModeName, TModeConfig> = {
  default: {
    bindServerUrl: '0.0.0.0',   // bind to all interfaces in order to receive external traffic
    skipAuth: false,            // hosted mode requires authentication
    name: EModeName.default,
  },
  docker: {
    bindServerUrl: '0.0.0.0',   // in docker container we have to bind to 0.0.0.0
    skipAuth: false,            // docker mode requires authentication
    name: EModeName.docker,
  },
  cli: {
    bindServerUrl: '127.0.0.1', // bind to localhost only, in order to prevent public access (app is only accessible locally)
    skipAuth: true,             // no need to authenticate when running app locally
    name: EModeName.cli,
  },
  dev: {
    bindServerUrl: '127.0.0.1', // bind to localhost only, in order to prevent public access (app is only accessible locally)
    skipAuth: true,             // no need to authenticate when running app locally
    name: EModeName.dev,
  }
};

const modeArg = Args.str("mode", "default") as EModeName;
export const modeConfig = modeConfigs[modeArg];
