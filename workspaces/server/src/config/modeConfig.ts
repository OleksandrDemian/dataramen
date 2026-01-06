export type TModeConfig = {
  bindServerUrl: string;
  skipAuth: boolean;
  name: string;
};

export enum EModeName {
  local = "local",
  hosted = "hosted",
}

const modeConfigs: Record<EModeName, TModeConfig> = {
  hosted: {
    bindServerUrl: '0.0.0.0',   // bind to all interfaces in order to receive external traffic
    skipAuth: false,            // hosted mode requires authentication
    name: EModeName.hosted,
  },
  local: {
    bindServerUrl: '127.0.0.1', // bind to localhost only, in order to prevent public access (app is only accessible locally)
    skipAuth: true,             // no need to authenticate when running app locally
    name: EModeName.local,
  }
};

const modeArg = process.argv[2] as EModeName | undefined;
if (!modeArg) {
  throw new Error(`Invalid mode "${process.argv[2]}"`);
}

export const modeConfig = modeConfigs[modeArg];
