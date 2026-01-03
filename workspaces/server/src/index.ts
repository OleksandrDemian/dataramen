import {validateEnvVariables} from "./services/env";

import "reflect-metadata";
import fastify from 'fastify';
import qs from "qs";
import { init } from './repository/db';

import "./types/extendFastify";
import {createDefaultOwnerUser} from "./services/users";
import {serverConfig} from "./config/serverConfig";
import {initRoutes} from "./api";
import {initHooks} from "./hooks";
import {initHandlers} from "./handlers";
import {initPlugins} from "./plugins";

(async function initialize () {
  const server = fastify({
    querystringParser: str => qs.parse(str),
  });

  validateEnvVariables();

  initPlugins(server);
  initHooks(server);
  initRoutes(server);
  initHandlers(server);

  await server.after();
  await init(); // init DB, perform migrations
  await createDefaultOwnerUser(); // creates default admin user if needed

  server.listen({ port: serverConfig.port, host: serverConfig.host }, (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Server listening at ${address}`);
  });
})();
