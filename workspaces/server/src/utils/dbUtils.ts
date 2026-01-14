import {Env} from "../services/env";
import {EModeName, modeConfig} from "../config/modeConfig";

export const TIMESTAMP_COLUMN_TYPE = Env.str("APP_DB_TYPE") === "sqlite" ? "datetime" : "timestamp";

type TGetUrl = (val: string) => string;
export const getUrl: TGetUrl = modeConfig.name === EModeName.docker ?
  (url) => {
    if (url === "localhost" || url === "127.0.0.1") {
      // override localhost URL when in docer env
      return "host.docker.internal";
    }
    return url;
  }
  :
  (url: string) => url;
