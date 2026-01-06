import { config, populate } from 'dotenv';
import { join, resolve } from "node:path";
import { readFileSync } from "node:fs";
import {TEnvKeys} from "../../types/env";

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

if (process.argv[3]) {
  envFiles.push(
    resolve(process.argv[3]),
  );
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

function getString(name: TEnvKeys, fallback: string): string;
function getString(name: TEnvKeys): string | undefined;
function getString(name: TEnvKeys, fallback: string | undefined = undefined): string | undefined {
  return process.env[name] || fallback;
}

function getNumber (name: TEnvKeys, fallback: number): number;
function getNumber (name: TEnvKeys): number | undefined;
function getNumber (name: TEnvKeys, fallback: number | undefined = undefined): number | undefined {
  const value = process.env[name];
  if (!value) {
    return fallback;
  }

  const num = Number(value);
  if (!isNaN(num) && value.trim() !== '') {
    return num;
  }

  return fallback;
}

function getBoolean(name: TEnvKeys): boolean {
  return process.env[name] === "true" || process.env[name] === "TRUE" || process.env[name] === "1";
}

export const Env = {
  str: getString,
  num: getNumber,
  bool: getBoolean,
};

export const hasCustomDbConfiguration = (): boolean => {
  return Env.str("APP_DB_TYPE") !== DEFAULT_CONFIG.APP_DB_TYPE && Env.str("APP_DB_DATABASE") !== DEFAULT_CONFIG.APP_DB_DATABASE;
};
