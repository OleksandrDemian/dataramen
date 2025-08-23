import {Env} from "../services/env";

export const TIMESTAMP_COLUMN_TYPE = Env.str("APP_DB_TYPE") === "sqlite" ? "datetime" : "timestamp";
