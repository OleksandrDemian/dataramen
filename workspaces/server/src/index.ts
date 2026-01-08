import {Env, validateEnvVariables} from "./services/env";

import "reflect-metadata";
import fastify from 'fastify';
import qs from "qs";
import { initDatabase } from './repository/db';

import "./types/extendFastify";
import {serverConfig} from "./config/serverConfig";
import {initRoutes} from "./api";
import {initHooks} from "./hooks";
import {initHandlers} from "./handlers";
import {initPlugins} from "./plugins";
import {generateSetupAccessToken, requireSetup} from "./services/setup";
import {initDefaultOwnerUser} from "./services/users";

async function initialize () {
  const server = fastify({
    querystringParser: str => qs.parse(str),
  });

  validateEnvVariables();

  initPlugins(server);
  initHooks(server);
  initRoutes(server);
  initHandlers(server);

  await server.after();
  await initDatabase(); // init DB, perform migrations

  server.listen({ port: serverConfig.port, host: serverConfig.host }, (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Server listening at ${address}`);
  });

  const hasToGoThroughSetup = await requireSetup();
  if (hasToGoThroughSetup) {
    const token = generateSetupAccessToken();
    console.log(`Setup access token:\n${token}`);
    console.log(`Use the above token to finish the setup process when opening the app for the first time.`);
  } else {
    await initDefaultOwnerUser();
  }
}

if (!Env.bool("IS_DESKTOP")) {
  // if not desktop, start the app, it is run from CLI
  initialize();
}

export {
  initialize,
};
