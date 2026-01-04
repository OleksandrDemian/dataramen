import {FastifyInstance} from "fastify";
import fastifyCookie from "@fastify/cookie";
import cors from "@fastify/cors";
import {serverConfig} from "../config/serverConfig";
import fastifyStatic from "@fastify/static";
import {join} from "node:path";

export const initPlugins = (server: FastifyInstance) => {
  server.register(fastifyCookie, {});
  server.register(cors, {
    origin: serverConfig.allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  });

  server.register(fastifyStatic, {
    root: join(__dirname, 'web'),
  });
};
