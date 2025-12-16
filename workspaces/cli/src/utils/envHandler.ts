import {readFileSync, writeFileSync} from "fs-extra";
import {join} from "node:path";
import {SERVER_PATH} from "../const";

type TRawValue = string | undefined;
type EnvVariables = Record<string, TRawValue>;
type EnvState = {
  fileName: string;
  customValues: EnvVariables;
};

function getEnvFileSafe (envFile: string): string | undefined {
  try {
    return readFileSync(join(SERVER_PATH, envFile), "utf-8");
  } catch (e) {
    return undefined;
  }
}

export function parseEnv(envName: string): EnvVariables {
  const env: EnvVariables = {};

  const file = getEnvFileSafe(envName);
  if (file) {
    const lines = file.split('\n');

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Ignore comments and empty lines
      if (!trimmedLine || trimmedLine.startsWith('#')) {
        continue;
      }

      const equalsIndex = trimmedLine.indexOf('=');
      if (equalsIndex === -1) continue;

      const key = trimmedLine.slice(0, equalsIndex).trim();
      let rawValue = trimmedLine.slice(equalsIndex + 1).trim();

      // Remove surrounding quotes
      if (
        (rawValue.startsWith('"') && rawValue.endsWith('"')) ||
        (rawValue.startsWith("'") && rawValue.endsWith("'"))
      ) {
        rawValue = rawValue.slice(1, -1);
      }

      env[key] = rawValue;
    }
  }

  return env;
}

function useEnvHandler () {
  const state: EnvState = {
    customValues: {},
    fileName: ".env",
  };

  function parse() {
    state.customValues = parseEnv(state.fileName);
  }

  function flush() {
    const lines = Object.entries(state.customValues).map(
      ([key, value]) => `${key}=${value}`
    );

    const output = lines.join('\n') + '\n';
    writeFileSync(join(SERVER_PATH, state.fileName), output, {
      encoding: 'utf8',
    });
  }

  function getValue (prop: string): TRawValue {
    if (state.customValues[prop]) {
      return state.customValues[prop];
    }

    return undefined;
  }

  parse();

  return {
    getNumber: (prop: string) => getNumber(getValue(prop)),
    getString: (prop: string) => getString(getValue(prop)),
    getBoolean: (prop: string) => getBoolean(getValue(prop)),
    flush: flush,
    set: (prop: string, value: string | number | boolean) => {
      state.customValues[prop] = value.toString();
    },
    unset: (prop: string) => {
      delete state.customValues[prop];
    },
    values: () => ({...state.customValues}),
  };
}

function getNumber (value: TRawValue): number | undefined {
  if (!value) {
    return undefined;
  }

  const num = Number(value);
  if (!isNaN(num) && value.trim() !== '') {
    return num;
  }

  throw new Error("Wrong env value type");
}

function getString (value: TRawValue): string | undefined {
  if (!value) {
    return undefined;
  }

  if (typeof value === "string") {
    return value;
  }

  throw new Error("Wrong env value type");
}

function getBoolean (value: TRawValue): boolean | undefined {
  if (!value) {
    return undefined;
  }

  const lower = value.toLowerCase();

  if (lower === 'true' || lower === "1") return true;
  if (lower === 'false' || lower === "0") return false;

  throw new Error("Wrong env value type");
}

export const env = useEnvHandler();
