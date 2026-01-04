import {FastifyInstance} from "fastify";
import {requestAuthHook} from "./auth";
import {requestRole} from "./role";
import {responseCloseDynamicConnections} from "./dynamicDbConnection";

export const initHooks = (server: FastifyInstance) => {
  server.addHook("onRequest", requestAuthHook);
  server.addHook("onRequest", requestRole);
  server.addHook("onResponse", responseCloseDynamicConnections);
};
