import {Env} from "../services/env";
import {modeConfig} from "./modeConfig";

export type TServerConfig = {
  port: number;
  host: string;
  allowedOrigins: string[] | '*';
};

const ALLOWED_ORIGINS = Env.str("ALLOWED_ORIGINS", "").split(",").map((v) => v.trim());
const PORT = Env.num("PORT", 4466);

export const serverConfig: TServerConfig = {
  port: PORT,
  host: modeConfig.bindServerUrl,
  allowedOrigins: ALLOWED_ORIGINS.includes("*") ? "*" : [
    `http://localhost:${PORT}`,
    ...ALLOWED_ORIGINS
  ],
};
