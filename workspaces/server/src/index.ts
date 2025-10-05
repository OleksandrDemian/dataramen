import {Env, validateEnvVariables} from "./services/env";

import "reflect-metadata";
import fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import qs from "qs";
import {HttpError} from "./utils/httpError";
import { init } from './repository/db';

import auth from "./api/auth/router";
import dataSources from "./api/dataSources/router";
import project from "./api/project/router";
import queries from "./api/queries/router";
import runner from "./api/runner/router";
import status from "./api/status/router";
import teams from "./api/teams/router";
import users from "./api/users/router";
import userSettings from "./api/userSettings/router";
import savedQueries from "./api/saved-queries/router";
import "./types/extendFastify";
import {TRouter} from "./utils/createRouter";
import { join } from "node:path";
import {requestAuthHook} from "./hooks/auth";
import {responseCloseDynamicConnections} from "./hooks/dynamicDbConnection";
import fastifyCookie from "@fastify/cookie";
import {createDefaultOwnerUser} from "./services/users";
import {requestRole} from "./hooks/role";

const server = fastify({
  querystringParser: str => qs.parse(str),
});
const PORT = Env.num("PORT", 4466);
const ALLOWED_ORIGINS = Env.str("ALLOWED_ORIGINS", "").split(",").map((v) => v.trim());
const HOST = '0.0.0.0';

const allowedOrigins = [
  `http://localhost:${PORT}`,
  ...ALLOWED_ORIGINS
];

function registerRouter (fn: TRouter, prefix: string) {
  server.register(fn, { prefix });
  console.log("Registered " + prefix);
}

(async function initialize () {
  validateEnvVariables();

  // const routers = glob.sync("./api/**/router.js", {
  //   cwd: __dirname,
  // });
  //
  // routers.forEach((file) => {
  //   const apiName = file.split("/")[2];
  //   const prefix = "/api/" + folderNameToSnakeCase(apiName);
  //   server.register(require(file), { prefix });
  //   console.log(`${prefix} -> ${apiName} controller `);
  // });

  await server.register(fastifyCookie, {});
  await server.register(cors, {
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) {
        cb(null, true);
      } else {
        cb(new Error('Not allowed by CORS'), false);
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  });

  await server.register(fastifyStatic, {
    root: join(__dirname, 'web'),
  });

  server.get("/", (_, rep) => {
    rep.sendFile("index.html");
  });

  server.addHook("onRequest", requestAuthHook);
  server.addHook("onRequest", requestRole);
  server.addHook("onResponse", responseCloseDynamicConnections);

  registerRouter(auth, `/api/auth`);
  registerRouter(dataSources, `/api/data-sources`);
  registerRouter(project, `/api/project`);
  registerRouter(queries, `/api/queries`);
  registerRouter(runner, `/api/runner`);
  registerRouter(status, `/api/status`);
  registerRouter(teams, `/api/teams`);
  registerRouter(users, `/api/users`);
  registerRouter(userSettings, `/api/user-settings`);
  registerRouter(savedQueries, `/api/saved-queries`);

  server.setNotFoundHandler((req, res) => {
    const url = req.raw.url;
    if (url?.startsWith("/api/")) {
      res.code(404).send({
        error: "API route not found",
      });
      return;
    }

    res.sendFile("index.html");
  });

  server.setErrorHandler((error, request, reply) => {
    console.error(error);
    if (error instanceof HttpError) {
      reply.status(error.status).send({
        error: error.message,
      });
      return;
    } else {
      reply.status(500).send({
        error: "Internal Server Error",
      });
    }
  });

  await server.after();
  await init(); // init DB, perform migrations
  await createDefaultOwnerUser(); // creates default admin user if needed

  server.listen({ port: PORT, host: HOST }, (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Server listening at ${address}`);
  });
})();
