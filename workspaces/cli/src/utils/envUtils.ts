import * as crypto from "node:crypto";
import {env} from "./envHandler";

export function generateDefaultEnvValues () {
  let flush = false;

  if (!env.getString("SYMM_ENCRYPTION_KEY")) {
    const randomEncKey = crypto.randomBytes(32).toString('hex');
    env.set("SYMM_ENCRYPTION_KEY", randomEncKey);
    console.log("Generated random SYMM_ENCRYPTION_KEY");
    flush = true;
  }

  if (!env.getString("JWT_SECRET")) {
    const randomJwtSecret = crypto.randomBytes(32).toString('hex');
    env.set("JWT_SECRET", randomJwtSecret);
    console.log("Generated random JWT_SECRET");
    flush = true;
  }

  if (!env.getString("JWT_REFRESH_SECRET")) {
    const randomJwtRefreshSecret = crypto.randomBytes(32).toString('hex');
    env.set("JWT_REFRESH_SECRET", randomJwtRefreshSecret);
    console.log("Generated random JWT_REFRESH_SECRET");
    flush = true;
  }

  if (flush) {
    env.flush();
  }
}
