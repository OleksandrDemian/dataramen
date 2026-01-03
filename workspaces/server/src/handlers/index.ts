import {FastifyInstance} from "fastify";
import {HttpError} from "../utils/httpError";

export const initHandlers = (server: FastifyInstance) => {
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
    } else {
      reply.status(500).send({
        error: "Internal Server Error",
      });
    }
  });
};
