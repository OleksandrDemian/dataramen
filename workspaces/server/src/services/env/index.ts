import { config, populate } from 'dotenv';
import { join, resolve } from "node:path";
import { readFileSync } from "node:fs";
import {TEnvKeys} from "../../types/env";
import {createValuesHandler} from "../../utils/valuesHandler";
import {Args} from "../../utils/argsParser";

const packageJson = (() => {
  try {
    const file = readFileSync(
      join(__dirname, "..", "package.json"),
      "utf8"
    );
    return JSON.parse(file);
  } catch (e) {
    return {
      version: "0.0.0",
    };
  }
})();

const envFiles: string[] = [];

const envFile = Args.str("env");
if (envFile) {
  envFiles.push(resolve(envFile));
}

config({
  path: envFiles,
});

const DEFAULT_CONFIG = {
  APP_DB_TYPE: "sqlite",
  APP_DB_DATABASE: "<home>/.dataramen/.runtime/db.sqlite3",
};
populate(process.env as any, {
  SERVER_VERSION: packageJson.version,
  PROD: "true",

  // defaults
  ...DEFAULT_CONFIG
}, {
  override: false, // prevent from overriding any existing value in custom env file
});

const REQUIRED_ENV_VARIABLES: TEnvKeys[] = ["SYMM_ENCRYPTION_KEY", "JWT_SECRET", "JWT_REFRESH_SECRET"];

export const validateEnvVariables = () => {
  const missingVariables: TEnvKeys[] = [];

  for (const envVariable of REQUIRED_ENV_VARIABLES) {
    if (!process.env[envVariable]) {
      missingVariables.push(envVariable);
    }
  }

  if (missingVariables.length > 0) {
    throw new Error('Following env variables are required but not provided: ' + missingVariables.join(', '));
  }
};

export const Env = createValuesHandler<TEnvKeys>(process.env as any);

export const hasCustomDbConfiguration = (): boolean => {
  return Env.str("APP_DB_TYPE") !== DEFAULT_CONFIG.APP_DB_TYPE && Env.str("APP_DB_DATABASE") !== DEFAULT_CONFIG.APP_DB_DATABASE;
};
